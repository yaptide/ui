import * as THREE from 'three';
import { Euler, Vector3 } from 'three';
// Import of 'lines' from examples subfolder follows the official guidelines of threejs.editor (see https://threejs.org/docs/#manual/en/introduction/Installation)
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { debounce } from 'throttle-debounce';
import { Editor } from '../js/Editor';
import { Particle, PARTICLE_TYPES } from './particles';
import { SimulationObject3D } from './SimulationBase/SimulationMesh';

export const SIGMA_TYPE = {
	'Gaussian': 'Gaussian',
	'Flat square': 'Flat square',
	'Flat circular': 'Flat circular'
} as const;
export type SigmaType = keyof typeof SIGMA_TYPE;

export const BEAM_SOURCE_TYPE = {
	'simple': 'simple',
	'file': 'file',
} as const;
export type BeamSourceType = keyof typeof BEAM_SOURCE_TYPE;

export interface BeamJSON {
	position: THREE.Vector3Tuple;
	direction: THREE.Vector3Tuple;
	energy: number;
	energySpread: number;
	beamSourceType: BeamSourceType;
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
	sigma: {
		type: SigmaType;
		x: number;
		y: number;
	};
	colorHex: number;
	numberOfParticles: number;
	definitionFile: DefinitionFile;
}

const _default = {
	position: new THREE.Vector3(0, 0, 0),
	direction: new THREE.Vector3(0, 0, 1),
	definitionType: BEAM_SOURCE_TYPE.simple,
	energy: 150,
	energySpread: 1.5,
	divergence: {
		x: 0,
		y: 0,
		distanceToFocal: 0
	},
	particle: {
		id: 2,
		a: 1,
		z: 1
	},
	sigma: {
		type: SIGMA_TYPE.Gaussian,
		x: 0,
		y: 0
	},
	numberOfParticles: 10000,

	definitionFile: {
		value: '',
		name: ''
	}
};

type DefinitionFile = {
	value: string;
	name: string;
}

export class Beam extends SimulationObject3D {
	readonly notRemovable: boolean = true;
	readonly notMovable = false;
	readonly notRotatable = true; //TODO: https://github.com/yaptide/ui/issues/242
	readonly notScalable = true;
	readonly notVisibleChildren = true;

	readonly isBeam: true = true;

	private _lineMaterial = new LineMaterial({
		color: 0xffff00, // yellow
		linewidth: 0.005, // in world units with size attenuation, pixels otherwise
		worldUnits: false
	});

	get material(): LineMaterial {
		return this._lineMaterial;
	}

	helper: THREE.ArrowHelper;

	energy: number;
	energySpread: number;
	direction: Vector3;

	definitionType: BeamSourceType = _default.definitionType;

	divergence: {
		x: number;
		y: number;
		distanceToFocal: number;
	};

	sigma: {
		type: SigmaType
		x: number;
		y: number;
	};

	numberOfParticles: number;

	particleData: {
		id: number;
		z: number;
		a: number;
	};

	beamSourceFile: DefinitionFile;

	get particle(): Particle {
		return PARTICLE_TYPES.find(p => p.id === this.particleData.id) as Particle;
	}

	private proxy: Beam; // use proxy if you want inform about changes

	readonly debouncedDispatchChanged = debounce(
		200,
		() => this.editor.signals.objectChanged.dispatch(this.proxy),
		{ atBegin: false }
	);

	private overrideHandler = {
		set: (target: Beam, prop: keyof Beam, value: unknown) => {
			const result = Reflect.set(target, prop, value);

			const informChange: (keyof Beam)[] = [
				'direction',
				'energy',
				'energySpread',
				'divergence',
				'particleData',
				'numberOfParticles',
				'sigma',
				'definitionType',
				'definitionFile'
			];
			if (informChange.includes(prop)) {
				this.debouncedDispatchChanged();
			}

			return result;
		}
	};

	constructor(editor: Editor) {
		super(editor, 'Beam', 'Beam');

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

		this.sigma = { ..._default.sigma };

		this.particleData = _default.particle;

		this.numberOfParticles = _default.numberOfParticles;

		this.beamSourceFile = { ..._default.definitionFile };

		this.helper = this.initHelper();

		this._lineMaterial.color = new Proxy(new THREE.Color(0xffff00), {
			get: (target: THREE.Color, prop: keyof THREE.Color) => {
				const scope = this;
				const result = Reflect.get(target, prop);
				if (prop === 'setHex') {
					return function (hex: number) {
						target[prop].apply(target, [hex]);
						scope.helper.setColor(hex);
						return scope._lineMaterial.color;
					};
				}
				return result;
			}
		});

		this.proxy = new Proxy(this, this.overrideHandler);

		return this.proxy;
	}

	initHelper() {
		const dir = this.direction.clone().normalize();
		const origin = new THREE.Vector3(0, 0, 0);
		const length = 1;
		const hex = 0xffff00; //yellow
		const helper = new THREE.ArrowHelper(dir, origin, length, hex, length * 0.3, length * 0.2);

		// line

		const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, length * 0.8, 0)];
		const positions = points.flatMap(point => point.toArray());

		const lineGeometry = new LineGeometry();
		lineGeometry.setPositions(positions);

		const line = new Line2(lineGeometry, this._lineMaterial);
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
		this.debouncedDispatchChanged.cancel({ upcomingOnly: true });


		this.rotation.copy(new Euler());
		this.position.copy(_default.position);
		this.direction.copy(_default.direction);

		this.energy = _default.energy;
		this.energySpread = _default.energySpread;
		this.divergence = { ..._default.divergence };
		this.particleData = _default.particle;
		this.sigma = { ..._default.sigma };
		this.definitionType = _default.definitionType;
		this.beamSourceFile = { ..._default.definitionFile };
		this.material.color.setHex(0xffff00); // yellow
		console.log('reset');
		console.log('this', this.beamSourceFile);

	}

	toJSON() {
		const jsonObject: BeamJSON = {
			position: this.position.toArray(),
			direction: this.direction.toArray(),
			energy: this.energy,
			energySpread: this.energySpread,
			sigma: this.sigma,
			divergence: this.divergence,
			particle: this.particleData,
			colorHex: this.material.color.getHex(),
			numberOfParticles: this.numberOfParticles,
			definitionFile: this.beamSourceFile,
			beamSourceType: this.definitionType
		};

		return jsonObject;
	}

	fromJSON(data: BeamJSON) {
		const loadedData = { ..._default, ...data };
		this.position.fromArray(loadedData.position);
		this.direction.fromArray(loadedData.direction);
		this.energy = loadedData.energy;
		this.energySpread = loadedData.energySpread;
		this.divergence = loadedData.divergence;
		this.particleData = loadedData.particle;
		this.material.color.setHex(loadedData.colorHex);
		this.numberOfParticles = loadedData.numberOfParticles;
		this.beamSourceFile = loadedData.definitionFile;
		this.sigma = loadedData.sigma;
		this.definitionType = loadedData.beamSourceType;
		return this;
	}

	static fromJSON(editor: Editor, data: BeamJSON) {
		return new Beam(editor).fromJSON(data);
	}
}

export const isBeam = (x: unknown): x is Beam => x instanceof Beam;
