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
	position: THREE.Vector3Tuple;
	direction: THREE.Vector3Tuple;
	energy: number;
	energySpread: number;
	divergence: {
		x: number;
		y: number;
		distanceToFocal: number;
	};
	particle: {
		id: number;
		z: number;
		a: number;
	};
}

const _default = {
	position: new THREE.Vector3(0, 0, 0),
	direction: new THREE.Vector3(0, 0, 1),
	energy: 150,
	energySpread: 1.5,
	divergence: {
		x: 0,
		y: 0,
		distanceToFocal: 0
	},
	particle: {
		id: 2,
		a: 12,
		z: 6
	}
};

export class Beam extends THREE.Object3D implements ISimulationObject {
	readonly notRemovable = true;
	readonly notMovable = false;
	readonly notRotatable = true; //TODO: https://github.com/yaptide/ui/issues/242
	readonly notScalable = true;

	readonly isBeam: true = true;

	editor: Editor;
	helper: THREE.ArrowHelper;

	energy: number;
	energySpread: number;
	direction: Vector3;

	divergence: {
		x: number;
		y: number;
		distanceToFocal: number;
	};

	particle: {
		id: number;
		z: number;
		a: number;
	};

	private proxy: Beam; // use proxy if you want inform about changes

	readonly debouncedDispatchChanged = debounce(200, false, () =>
		this.editor.signals.objectChanged.dispatch(this.proxy)
	);

	private overrideHandler = {
		set: (target: Beam, prop: keyof Beam, value: unknown) => {
			const result = Reflect.set(target, prop, value);

			const informChange: (keyof Beam)[] = ['direction', 'energy', 'divergence'];
			if (informChange.includes(prop)) {
				this.debouncedDispatchChanged();
			}

			return result;
		}
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
			}
		};

		const proxyDirection = new Proxy(_default.direction.clone(), overrideHandlerDirection);
		this.direction = proxyDirection;

		this.position.copy(_default.position);
		this.energy = _default.energy;
		this.energySpread = _default.energySpread;

		this.divergence = { ..._default.divergence };

		this.particle = _default.particle;

		this.helper = this.initHelper();

		this.proxy = new Proxy(this, this.overrideHandler);

		return this.proxy;
	}

	initHelper() {
		const dir = this.direction.clone().normalize();
		const origin = new THREE.Vector3(0, 0, 0);
		const length = 1;
		const hex = 0xffff00;
		const helper = new THREE.ArrowHelper(dir, origin, length, hex, length * 0.3, length * 0.2);

		// line

		const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, length * 0.8, 0)];
		const positions = points.flatMap(point => point.toArray());

		const lineGeometry = new LineGeometry();
		lineGeometry.setPositions(positions);

		const matLine = new LineMaterial({
			color: hex,
			linewidth: 0.005, // in world units with size attenuation, pixels otherwise
			worldUnits: false
		});

		const line = new Line2(lineGeometry, matLine);
		line.renderOrder = 1;
		line.computeLineDistances();
		line.scale.set(1, 1, 1);
		helper.add(line);

		// dots

		const dotGeometry = new THREE.BufferGeometry();
		dotGeometry.setAttribute(
			'position',
			new THREE.Float32BufferAttribute(new Vector3(0, 0, 0).toArray(), 3)
		);
		const redDotMaterial = new THREE.PointsMaterial({
			size: 8,
			color: 0xff0000,
			sizeAttenuation: false,
			depthTest: false
		});
		const redDot = new THREE.Points(dotGeometry, redDotMaterial);
		redDot.renderOrder = 2;

		const blackDotMaterial = new THREE.PointsMaterial({
			size: 2,
			color: 0x000000,
			sizeAttenuation: false,
			depthTest: false
		});
		const blackDot = new THREE.Points(dotGeometry, blackDotMaterial);
		blackDot.renderOrder = 3;

		helper.add(redDot);
		helper.add(blackDot);

		this.add(helper);
		return helper;
	}

	reset(): void {
		this.rotation.copy(new Euler());
		this.position.copy(_default.position);
		this.direction.copy(_default.direction);

		this.energy = _default.energy;
		this.energySpread = _default.energySpread;
		this.divergence = { ..._default.divergence };
		this.particle = _default.particle;
	}

	copy(source: this, recursive = true) {
		return new Proxy(super.copy(source, recursive), this.overrideHandler) as this;
	}

	toJSON() {
		const jsonObject: BeamJSON = {
			position: this.position.toArray(),
			direction: this.direction.toArray(),
			energy: this.energy,
			energySpread: this.energySpread,
			divergence: this.divergence,
			particle: this.particle
		};

		return jsonObject;
	}

	fromJSON(data: BeamJSON) {
		this.position.fromArray(data.position);
		this.direction.fromArray(data.direction);
		this.energy = data.energy;
		this.energySpread = data.energySpread;
		this.divergence = data.divergence;
		this.particle = data.particle
		return this;
	}

	static fromJSON(editor: Editor, data: BeamJSON) {
		return new Beam(editor).fromJSON(data);
	}
}

export const isBeam = (x: unknown): x is Beam => x instanceof Beam;
