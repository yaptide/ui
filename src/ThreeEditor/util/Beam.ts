import * as THREE from 'three';
import { Euler, Vector3 } from 'three';
import { debounce } from 'throttle-debounce';
import { Editor } from '../js/Editor';
// Import of 'lines' from examples subfolder follows the official guidelines of threejs.editor (see https://threejs.org/docs/#manual/en/introduction/Installation)
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { ISimulationObject } from './SimulationObject';

export interface BeamJSON {
    type: string,
    position: THREE.Vector3Tuple,
    direction: THREE.Vector3Tuple,
    energy: number
}

const _default = {
    position: new THREE.Vector3(0, 0, 0),
    direction: new THREE.Vector3(0, 0, 1),
    energy: 150,
}

export class Beam extends THREE.Object3D implements ISimulationObject {
    notRemovable = true;
    notMoveable = true;
    
    editor: Editor;
    helper: THREE.ArrowHelper;

    energy: number;
    direction: Vector3;

    private proxy: Beam; // use proxy if you want inform about changes 

    readonly debouncedDispatchChanged = debounce(200, false, () =>
        this.editor.signals.objectChanged.dispatch(this.proxy)
    );

    private overrideHandler = {
        set: (target: Beam, prop: keyof Beam, value: unknown) => {
            const result = Reflect.set(target, prop, value);

            const informChange: (keyof Beam)[] = ['direction', 'energy'];
            if (informChange.includes(prop)) {
                this.debouncedDispatchChanged();
            }

            return result;
        },
    };

    constructor(editor: Editor) {
        super();
        this.type = 'Beam';
        this.name = 'Beam';
        this.editor = editor;

        const overrideHandlerDirection = {
            set: (target: THREE.Vector3, prop: keyof THREE.Vector3, value: unknown) => {
                const result = Reflect.set(target, prop, value);
                this.helper.setDirection(target.clone().normalize());
                this.debouncedDispatchChanged();
                return result;
            },
        };

        const proxyDirection = new Proxy(_default.direction.clone(), overrideHandlerDirection);
        this.direction = proxyDirection;

        this.position.copy(_default.position);
        this.energy = _default.energy;

        this.helper = this.initHelper();

        this.proxy = new Proxy(this, this.overrideHandler);  

        return this.proxy;
    }


    initHelper() {
        const dir = this.direction.clone().normalize();
        const origin = new THREE.Vector3(0, 0, 0);
        const length = 1;
        const hex = 0xffff00;
        const helper = new THREE.ArrowHelper(dir, origin, length, hex, length * .3, length * .2);

        // line 

        const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, length * .8, 0)];
        const positions = points.flatMap((point) => point.toArray());

        const lineGeometry = new LineGeometry();
        lineGeometry.setPositions(positions);

        const matLine = new LineMaterial({
            color: hex,
            linewidth: .005, // in world units with size attenuation, pixels otherwise  
            worldUnits: false,
        });

        const line = new Line2(lineGeometry, matLine);
        line.renderOrder = 1;
        line.computeLineDistances();
        line.scale.set(1, 1, 1);
        helper.add(line);

        // dots

        const dotGeometry = new THREE.BufferGeometry();
        dotGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new Vector3(0, 0, 0).toArray(), 3));
        const redDotMaterial = new THREE.PointsMaterial({ size: 8, color: 0xff0000, sizeAttenuation: false, depthTest: false });
        const redDot = new THREE.Points(dotGeometry, redDotMaterial);
        redDot.renderOrder = 2;

        const blackDotMaterial = new THREE.PointsMaterial({ size: 2, color: 0x000000, sizeAttenuation: false, depthTest: false });
        const blackDot = new THREE.Points(dotGeometry, blackDotMaterial);
        blackDot.renderOrder = 3;

        helper.add(redDot);
        helper.add(blackDot);

        this.add(helper);
        return helper;
    }


    reset() {
        this.rotation.copy(new Euler());
        this.position.copy(_default.position);
        this.direction.copy(_default.direction);
        this.energy = _default.energy;
    }

    copy(source: this, recursive = true) {
        return new Proxy(super.copy(source, recursive), this.overrideHandler) as this;
    }

    toJSON() {
        const jsonObject: BeamJSON = {
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

/**
 * @deprecated Use readonly property instead.
 */
export const isBeam = (x: unknown): x is Beam => x instanceof Beam;