import * as THREE from 'three';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationPoints, SimulationPointsJSON } from '../Base/SimulationPoints';

type ModulatorGeometryDataType = {
	geometryType: 'Zone';
	parameters: ModulatorParameters;
};

type ModulatorParameters = {
	zoneUuid: string;
};

export type BeamModulatorJSON = Omit<
	SimulationPointsJSON & {
		geometryData: ModulatorGeometryDataType;
		modulatorMode: BeamModulatorMode;
	},
	never
>;

export const BEAM_MODULATOR_MODE_OPTIONS = ['Modulus', 'MonteCarloSampling'] as const;

export type BeamModulatorMode = (typeof BEAM_MODULATOR_MODE_OPTIONS)[number];

export class BeamModulator extends SimulationPoints {
	pointsHelper: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
	reset(): void {
		super.reset();
	}
	tryUpdateGeometry(): void {
		this.geometry.dispose();
		if (this._zoneUuid) {
			const zone = this.editor.zoneManager.getZoneByUuid(this._zoneUuid);
			this.geometry = zone?.geometry?.clone() ?? new THREE.BufferGeometry();

			this.material.color =
				zone?.material.color ?? this.editor.materialManager.defaultMaterial.color.clone();
		}
		this.geometry.computeBoundingSphere();
	}
	get geometryParameters(): ModulatorParameters {
		return {
			zoneUuid: this._zoneUuid
		};
	}
	set geometryParameters(parameters: ModulatorParameters) {
		const { zoneUuid } = parameters;
		this._zoneUuid = zoneUuid ?? this._zoneUuid;
		this.tryUpdateGeometry();
	}

	readonly geometryType: 'Zone' = 'Zone';
	readonly isBeamModulator: true = true;
	private _zoneUuid: string = '';
	get geometryData(): ModulatorGeometryDataType {
		const { _zoneUuid: zoneUuid, geometryType } = this;
		return {
			geometryType,
			parameters: {
				zoneUuid
			}
		};
	}
	modulatorMode: BeamModulatorMode = 'Modulus';
	set geometryData(data: ModulatorGeometryDataType) {
		const { geometryType, parameters } = data;
		if (geometryType !== 'Zone') throw new Error('Invalid geometry type');
		const { zoneUuid } = parameters;
		this._zoneUuid = zoneUuid;
		this.tryUpdateGeometry();
	}
	constructor(editor: YaptideEditor) {
		super(
			editor,
			'Beam Modulator',
			'BeamModulator',
			new THREE.PointsMaterial({
				color: editor.materialManager.defaultMaterial.color.clone(),
				size: 0.3
			})
		);
		this.geometry = new THREE.BufferGeometry();
		this.pointsHelper = new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial({
				color: 0x000000,
				side: THREE.DoubleSide,
				transparent: true,
				opacity: 0.5,
				wireframe: true
			})
		);
	}
	toJSON(): BeamModulatorJSON {
		const { geometryData, modulatorMode } = this;
		return {
			...super.toJSON(),
			geometryData,
			modulatorMode
		};
	}
	fromJSON(json: BeamModulatorJSON): this {
		const { geometryData, modulatorMode, ...rest } = json;
		super.fromJSON(rest);
		this.geometryData = json.geometryData;
		this.modulatorMode = json.modulatorMode;
		return this;
	}
}

export function isBeamModulator(x: unknown): x is BeamModulator {
	return x instanceof BeamModulator;
}
