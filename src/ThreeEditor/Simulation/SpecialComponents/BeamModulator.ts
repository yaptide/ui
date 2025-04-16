import * as THREE from 'three';

import { ConfigSourceFile } from '../../../types/SimulationTypes/ConfigTypes';
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
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notDuplicatable = true;
	wireframeHelper: THREE.Mesh;

	sourceFile: ConfigSourceFile = {
		name: '',
		value: ''
	};

	reset(): void {
		super.reset();
		this._zoneUuid = '';
		this.simulationMethod = 'modulus';
		this.sourceFile = {
			name: '',
			value: ''
		};
	}

	tryUpdateGeometry(): void {
		this.geometry.dispose();

		if (this._zoneUuid) {
			const zone = this.editor.zoneManager.getZoneByUuid(this._zoneUuid);

			if (!zone) throw new Error(`No zone with uuid ${this._zoneUuid} found!`);
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

	toSerialized(): BeamModulatorJSON {
		const { geometryData, simulationMethod, sourceFile } = this;

		return {
			...super.toSerialized(),
			geometryData,
			simulationMethod,
			sourceFile
		};
	}

	fromSerialized(json: BeamModulatorJSON): this {
		const { geometryData, simulationMethod, sourceFile, ...rest } = json;
		super.fromSerialized(rest);
		this.geometryData = geometryData;
		this.simulationMethod = simulationMethod;
		this.sourceFile = sourceFile;

		return this;
	}

	// eslint-disable-next-line class-methods-use-this
	duplicate(): SimulationPoints {
		throw new Error('Method not implemented');
	}
}

export function isBeamModulator(x: unknown): x is BeamModulator {
	return x instanceof BeamModulator;
}
