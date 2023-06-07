import * as THREE from 'three';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationPoints, SimulationPointsJSON } from '../Base/SimulationPoints';

type ModulatorGeometryDataType = {
	geometryType: 'Zone';
	parameters: ModulatorParameters;
};

type ModulatorParameters = {
	zoneUuid: string;
	modulatorMode: 'Modulus' | 'MonteCarloSampling';
};

export type BeamModulatorJSON = Omit<SimulationPointsJSON<ModulatorGeometryDataType>, never>;

export class BeamModulator extends SimulationPoints<ModulatorGeometryDataType> {
	pointsHelper: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
	reset(): void {
		super.reset();
	}
	tryUpdateGeometry(): void {
		this.geometry.dispose();
		if (this._zoneUuid) {
			const zone = this.editor.zoneManager.getZoneByUuid(this._zoneUuid);
			this.geometry = zone?.geometry?.clone() ?? new THREE.BufferGeometry();
		}
		this.geometry.computeBoundingSphere();
	}
	get geometryParameters(): ModulatorParameters {
		return {
			zoneUuid: this._zoneUuid,
			modulatorMode: this._modulatorMode
		};
	}
	set geometryParameters(parameters: ModulatorParameters) {
		const { zoneUuid, modulatorMode } = parameters;
		this._zoneUuid = zoneUuid;
		this._modulatorMode = modulatorMode;
		this.tryUpdateGeometry();
	}

	readonly geometryType: 'Zone' = 'Zone';
	readonly isBeamModulator: true = true;
	private _zoneUuid: string = '';
	private _modulatorMode: 'Modulus' | 'MonteCarloSampling' = 'Modulus';
	get geometryData(): ModulatorGeometryDataType {
		const { _zoneUuid: zoneUuid, _modulatorMode: modulatorMode, geometryType } = this;
		return {
			geometryType,
			parameters: {
				zoneUuid,
				modulatorMode
			}
		};
	}
	set geometryData(data: ModulatorGeometryDataType) {
		console.error('set geometryData', data, this);
		const { geometryType, parameters } = data;
		if (geometryType !== 'Zone') throw new Error('Invalid geometry type');
		const { zoneUuid, modulatorMode } = parameters;
		this._zoneUuid = zoneUuid;
		this._modulatorMode = modulatorMode;
		this.tryUpdateGeometry();
	}
	constructor(editor: YaptideEditor) {
		super(
			editor,
			'Beam Modulator',
			'BeamModulator',
			new THREE.PointsMaterial({
				color: editor.materialManager.defaultMaterial.color.clone(),
				size: 0.2
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
}

export function isBeamModulator(x: unknown): x is BeamModulator {
	return x instanceof BeamModulator;
}
