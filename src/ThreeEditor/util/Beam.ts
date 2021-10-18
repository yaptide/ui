import * as THREE from 'three';
import { Euler, Vector3 } from 'three';
import { debounce } from 'throttle-debounce';
import { Editor } from '../js/Editor';

export interface BeamJSON {
    type: string,
    position: THREE.Vector3Tuple,
    direction: THREE.Vector3Tuple,
    energy: number
}

export class Beam extends THREE.Object3D {
    editor: Editor;
    helper: THREE.ArrowHelper;

    energy: number;
    direction: Vector3;

    readonly debouncedDispatchChanged = debounce(200, false, () =>
        this.editor.signals.objectChanged.dispatch(this)
    );

    constructor(editor: Editor) {
        super();
        this.type = 'Beam' as any;
        this.name = 'Beam';
        this.editor = editor;

        const overrideHandler = {
            set: (target: THREE.Vector3, prop: keyof THREE.Vector3, value: any) => {
                const result = Reflect.set(target, prop, value);
                this.helper.setDirection(target.clone().normalize());
                this.debouncedDispatchChanged();
                return result;
            },
        };

        const proxyDirection = new Proxy(new THREE.Vector3(0, 0, 1), overrideHandler);
        this.direction = proxyDirection;

        const dir = this.direction.clone().normalize();
        const origin = new THREE.Vector3(0, 0, 0);
        const length = 5;
        const hex = 0xffff00;
        this.helper = new THREE.ArrowHelper(dir, origin, length, hex);
        this.add(this.helper);

        this.position.set(0, 0, -1);

        this.energy = 0;

        const overrideHandlerThis = {
            set: (target: Beam, prop: keyof Beam, value: any) => {
                const result = Reflect.set(target, prop, value);

                const informChange: (keyof Beam)[] = ['direction', 'energy'];
                if (informChange.includes(prop)) {
                    this.debouncedDispatchChanged();
                }

                return result;
            },
        };

        return new Proxy(this, overrideHandlerThis)
    }


    reset() {
        this.position.copy(new Vector3(0, 0, -1));
        this.rotation.copy(new Euler());
        this.direction.copy(new Vector3(0, 0, 1));
        this.energy = 0;
    }

    toJSON() {

        let jsonObject: BeamJSON = {
            type: this.type,
            position: this.position.toArray(),
            direction: this.direction.toArray(),
            energy: this.energy
        };

        return jsonObject;
    }

    fromJSON(data: BeamJSON) {
        this.position.fromArray(data.position);
        this.direction.fromArray(data.direction);
        this.energy = data.energy;
        return this;
    }

    static fromJSON(editor: Editor, data: BeamJSON) {

        return new Beam(editor).fromJSON(data);

    }

}

export const isBeam = (x: any): x is Beam => x instanceof Beam;