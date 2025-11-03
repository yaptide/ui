import * as THREE from 'three';
import { Euler, Vector3 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

import { COMMON_PARTICLE_TYPES, FLUKA_PARTICLE_TYPES, Particle } from '../../../types/Particle';
// Import of 'lines' from examples subfolder follows the official guidelines of threejs.editor (see https://threejs.org/docs/#manual/en/introduction/Installation)
import { ConfigSourceFile } from '../../../types/SimulationTypes/ConfigTypes';
import { SerializableState } from '../../js/EditorJson';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationElement, SimulationElementJSON } from '../Base/SimulationElement';

export const SIGMA_TYPE = {
	'Gaussian': 'Gaussian',
	'Flat square': 'Flat square',
	'Flat circular': 'Flat circular'
} as const;
export type SigmaType = keyof typeof SIGMA_TYPE;

export const SAD_TYPE = {
	none: 'none',
	single: 'single (X=Y)',
	double: 'double (X and Y)'
} as const;
export type SadType = keyof typeof SAD_TYPE;

export const BEAM_SOURCE_TYPE = {
	simple: 'simple',
	file: 'file'
} as const;
export type BeamSourceType = keyof typeof BEAM_SOURCE_TYPE;

export const EnergyUnits = ['MeV', 'MeV/nucl'];
export type EnergyUnit = (typeof EnergyUnits)[number];

export type BeamJSON = Omit<
	SimulationElementJSON & {
		position: THREE.Vector3Tuple;
		direction: THREE.Vector3Tuple;
		energyUnit: EnergyUnit;
		energy: number;
		energySpread: number;
		energyLowCutoff: number;
		energyHighCutoff: number;
		sourceType: BeamSourceType;
		divergence: {
			x: number;
			y: number;
			distanceToFocal: number;
		};
		particle: Particle;
		sigma: {
			type: SigmaType;
			x: number;
			y: number;
		};

		sad: {
			type: SadType;
			x: number;
			y: number;
		};

		colorHex: number;
		numberOfParticles: number;
		sourceFile: ConfigSourceFile;
	},
	never
>;

const _default = {
	position: new THREE.Vector3(0, 0, 0),
	direction: new THREE.Vector3(0, 0, 1),
	sourceType: BEAM_SOURCE_TYPE.simple,
	energyUnit: 'MeV',
	energy: 150,
	energySpread: 1.5,
	energyLowCutoff: 0,
	energyHighCutoff: 1000,
	divergence: {
		x: 0,
		y: 0,
		distanceToFocal: 0
	},
	particle: {
		id: 2,
		name: 'Proton',
		a: 1,
		z: 1
	},
	sigma: {
		type: SIGMA_TYPE.Gaussian,
		x: 0,
		y: 0
	},
	sad: {
		type: SAD_TYPE.none,
		x: 0,
		y: 0
	},

	numberOfParticles: 10000,

	sourceFile: {
		value: '',
		name: ''
	}
};

export class Beam extends SimulationElement implements SerializableState<BeamJSON> {
	readonly notRemovable: boolean = true;
	readonly notMovable = false;
	readonly notRotatable = true; //TODO: https://github.com/yaptide/ui/issues/242
	readonly notScalable = true;
	readonly notVisibleChildren = true;
	readonly notHidable = true;

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

	energyUnit: EnergyUnit;
	energy: number;
	energySpread: number;
	energyLowCutoff: number;
	energyHighCutoff: number;
	direction: Vector3;

	sourceType: BeamSourceType = _default.sourceType;

	divergence: {
		x: number;
		y: number;
		distanceToFocal: number;
	};

	sigma: {
		type: SigmaType;
		x: number;
		y: number;
	};

	sad: {
		type: SadType;
		x: number;
		y: number;
	};

	numberOfParticles: number;

	particleData: Particle;

	sourceFile: ConfigSourceFile;

	get particle(): Particle {
		return [...COMMON_PARTICLE_TYPES, ...FLUKA_PARTICLE_TYPES].find(
			p => p.id === this.particleData.id
		) as Particle;
	}

	constructor(editor: YaptideEditor) {
		super(editor, 'Beam', 'Beam');

		const overrideHandlerDirection = {
			set: (target: THREE.Vector3, prop: keyof THREE.Vector3, value: unknown) => {
				const result = Reflect.set(target, prop, value);
				this.helper.setDirection(target.clone().normalize());

				return result;
			}
		};

		const proxyDirection = new Proxy(_default.direction.clone(), overrideHandlerDirection);
		this.direction = proxyDirection;

		this.position.copy(_default.position);
		this.energyUnit = _default.energyUnit;
		this.energy = _default.energy;
		this.energySpread = _default.energySpread;
		this.energyLowCutoff = _default.energyLowCutoff;
		this.energyHighCutoff = _default.energyHighCutoff;

		this.divergence = { ..._default.divergence };

		this.sigma = { ..._default.sigma };

		this.sad = { ..._default.sad };

		this.particleData = _default.particle;

		this.numberOfParticles = _default.numberOfParticles;

		this.sourceFile = { ..._default.sourceFile };

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
	}

	initHelper() {
		const dir = this.direction.clone().normalize();
		const origin = new THREE.Vector3(0, 0, 0);
		const length = 4;
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
		this.rotation.copy(new Euler());
		this.position.copy(_default.position);
		this.direction.copy(_default.direction);

		this.energy = _default.energy;
		this.energySpread = _default.energySpread;
		this.energyLowCutoff = _default.energyLowCutoff;
		this.energyHighCutoff = _default.energyHighCutoff;

		this.divergence = { ..._default.divergence };
		this.particleData = _default.particle;
		this.sigma = { ..._default.sigma };
		this.sourceType = _default.sourceType;
		this.sourceFile = { ..._default.sourceFile };
		this.material.color.setHex(0xffff00); // yellow
	}

	toSerialized() {
		const jsonObject: BeamJSON = {
			...super.toSerialized(),
			position: this.position.toArray(),
			direction: this.direction.toArray(),
			energyUnit: this.energyUnit,
			energy: this.energy,
			energySpread: this.energySpread,
			energyLowCutoff: this.energyLowCutoff,
			energyHighCutoff: this.energyHighCutoff,
			sigma: this.sigma,
			sad: this.sad,
			divergence: this.divergence,
			particle: this.particleData,
			colorHex: this.material.color.getHex(),
			numberOfParticles: this.numberOfParticles,
			sourceFile: this.sourceFile,
			sourceType: this.sourceType
		};

		return jsonObject;
	}

	fromSerialized(data: BeamJSON) {
		super.fromSerialized(data);
		const loadedData = { ..._default, ...data };
		this.position.fromArray(loadedData.position);
		this.direction.fromArray(loadedData.direction);
		this.energyUnit = loadedData.energyUnit;
		this.energy = loadedData.energy;
		this.energySpread = loadedData.energySpread;
		this.energyLowCutoff = loadedData.energyLowCutoff;
		this.energyHighCutoff = loadedData.energyHighCutoff;
		this.divergence = loadedData.divergence;
		this.particleData = loadedData.particle;
		this.material.color.setHex(loadedData.colorHex);
		this.numberOfParticles = loadedData.numberOfParticles;
		this.sourceFile = loadedData.sourceFile;
		this.sigma = loadedData.sigma;
		this.sad = loadedData.sad;
		this.sourceType = loadedData.sourceType;
		this.sourceFile = loadedData.sourceFile;

		return this;
	}

	static fromSerialized(editor: YaptideEditor, data: BeamJSON) {
		return new Beam(editor).fromSerialized(data);
	}
}

export const isBeam = (x: unknown): x is Beam => x instanceof Beam;
