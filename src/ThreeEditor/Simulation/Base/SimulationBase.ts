import * as THREE from 'three';

import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationSceneContainer } from './SimulationContainer';
import { SimulationElementJSON } from './SimulationElement';

function WithTHREE<TBase extends THREE.Object3D = THREE.Object3D>(proxy: TBase) {
	return function <TProxy extends { new (...args: any[]): {} }>(
		constructor: TProxy,
		context: ClassDecoratorContext
	) {
		const dummyObj = Object.create(null);

		return class extends constructor {
			_proxy: TBase;
			constructor(...args: any[]) {
				super(...args);
				this._proxy = proxy;

				return new Proxy(dummyObj as this & TBase, {
					get: (_, prop, receiver) =>
						Reflect.get(prop in this ? this : this._proxy, prop, receiver),
					set: (_, prop, value, receiver) =>
						Reflect.set(prop in this ? this : this._proxy, prop, value, receiver),
					has: (_, prop) => Reflect.has(prop in this ? this : this._proxy, prop),
					ownKeys: _ =>
						[
							...Reflect.ownKeys(this._proxy),
							...Reflect.ownKeys(this).filter(value => value !== '_proxy')
						].filter((value, index, self) => self.indexOf(value) === index),
					getOwnPropertyDescriptor: (target, prop) => {
						const descriptor = Reflect.getOwnPropertyDescriptor(
							prop in this ? this : this._proxy,
							prop
						);

						if (descriptor) Object.defineProperty(target, prop, descriptor);

						return descriptor;
					}
				});
			}
		};
	};
}

@WithTHREE(new THREE.Object3D())
export class SimulationBase {
	editor: Record<string, unknown>;
	parent: SimulationSceneContainer<this> | null = null;
	readonly type: string;
	readonly isSimulationElement = true;
	_name: string;

	constructor(name: string | undefined, type: string) {
		this.editor = {
			editorProps: true
		};
		this.name = this._name = name ?? type;
		this.type = type;
	}

	toJSON(): SimulationElementJSON {
		const { name, type, uuid } = this;

		return {
			name,
			type,
			uuid
		};
	}

	fromJSON(json: SimulationElementJSON): this {
		this.name = json.name;
		this.uuid = json.uuid;

		return this;
	}

	reset() {
		this.name = this._name;
	}
}

export interface SimulationBase extends THREE.Object3D {
	_proxy: THREE.Object3D;
}

const element = new SimulationBase('test', 'test');
element.position.set(1, 2, 3);
Object.keys(element).forEach(key => {
	console.log(key);
});
