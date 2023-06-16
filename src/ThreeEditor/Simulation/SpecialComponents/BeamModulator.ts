import * as THREE from 'three';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationPoints, SimulationPointsJSON } from '../Base/SimulationPoints';
import { ConfigSourceFile } from '../../../types/SimulationTypes/ConfigTypes';

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
		simulationMethod: BeamsimulationMethod;
		sourceFile: ConfigSourceFile;
	},
	never
>;

export const BEAM_MODULATOR_MODE_OPTIONS = ['modulus', 'sampling'] as const;

export type BeamsimulationMethod = (typeof BEAM_MODULATOR_MODE_OPTIONS)[number];

/**
 * Simulation component for beam modulator
 * used to simulate the effect of compex geometries such as:
 * - ripple filters
 * - ridge filters
 * - modulator wheels
 *
 * Element defines a method, file with definition and zone to apply to the changes in physics.
 */
export class BeamModulator extends SimulationPoints {
	sourceFile: ConfigSourceFile = {
		name: '',
		value: ''
	};
	notMovable = true;
	wireframeHelper: THREE.Mesh;

	reset(): void {
		super.reset();
		this._zoneUuid = '';
		this.simulationMethod = 'modulus';
		this.sourceFile = {
			name: '',
			value: ''
		};
		this.tryUpdateGeometry();
	}
	tryUpdateGeometry(): void {
		this.geometry.dispose();
		if (this._zoneUuid) {
			const zone = this.editor.zoneManager.getZoneByUuid(this._zoneUuid);
			this.geometry =
				zone?.geometry
					?.clone()
					.translate(zone.position.x, zone.position.y, zone.position.z) ??
				new THREE.BufferGeometry();

			this.material.color =
				zone?.material.color ?? this.editor.materialManager.defaultMaterial.color.clone();
		}
		this.geometry.computeBoundingSphere();
		this.editor.signals.objectSelected.dispatch(this);
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
	simulationMethod: BeamsimulationMethod = 'modulus';
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
				size: 0.5
			})
		);
		this.geometry = new THREE.BufferGeometry();
		this.wireframeHelper = editor.specialComponentsManager.beamModulatorHelper;
	}
	toJSON(): BeamModulatorJSON {
		const { geometryData, simulationMethod, sourceFile } = this;
		return {
			...super.toJSON(),
			geometryData,
			simulationMethod,
			sourceFile
		};
	}
	fromJSON(json: BeamModulatorJSON): this {
		const { geometryData, simulationMethod, sourceFile, ...rest } = json;
		super.fromJSON(rest);
		this.geometryData = geometryData;
		this.simulationMethod = simulationMethod;
		this.sourceFile = sourceFile;
		return this;
	}
}

export function isBeamModulator(x: unknown): x is BeamModulator {
	return x instanceof BeamModulator;
}
