import { Signal } from 'signals';
import * as THREE from 'three';

import * as DETECT from '../../../types/SimulationTypes/DetectTypes/DetectTypes';
import { AdditionalGeometryDataType, getGeometryData } from '../../../util/AdditionalGeometryData';
import { YaptideEditor } from '../../js/YaptideEditor';
import { HollowCylinderGeometry } from '../Base/HollowCylinderGeometry';
import { SimulationPoints, SimulationPointsJSON } from '../Base/SimulationPoints';
import { SimulationZone } from '../Base/SimulationZone';

type AdditionalDetectGeometryDataType = Omit<
	AdditionalGeometryDataType & {
		parameters: DETECT.Any;
		geometryType: DETECT.DETECTOR_TYPE;
	},
	never
>;

export type DetectorJSON = Omit<
	SimulationPointsJSON & { geometryData: AdditionalDetectGeometryDataType },
	never
>;

const detectPointsMaterial: THREE.PointsMaterial = new THREE.PointsMaterial({
	color: new THREE.Color('cyan'),
	size: 0.1
});

export class Detector extends SimulationPoints {
	readonly notRemovable: boolean = false;
	map: null = null;
	alphaMap: null = null;
	size: number = 1;
	sizeAttenuation: boolean = true;
	wireframeHelper: THREE.Mesh;

	get notMovable() {
		// custom get function to conditionally return notMoveable property;
		return ['Zone', 'All'].includes(this.detectorType);
	}

	get zone(): SimulationZone | null {
		const data = this.getData();

		if (data.zoneUuid) return this.editor.zoneManager.getZoneByUuid(data.zoneUuid) ?? null;
		else return null;
	}

	readonly notRotatable = true;
	readonly notScalable = true;
	readonly isDetector: true = true;
	private _detectorType: DETECT.DETECTOR_TYPE;
	private proxy: Detector;

	get detectorType(): DETECT.DETECTOR_TYPE {
		return this._detectorType;
	}

	set detectorType(value: DETECT.DETECTOR_TYPE) {
		this._detectorType = value;
		this.tryUpdateGeometry();
	}

	get geometryData(): AdditionalDetectGeometryDataType {
		const partialData = getGeometryData(this);
		const geometryType = this.detectorType;
		const geometryData: AdditionalDetectGeometryDataType = {
			...partialData,
			parameters: this.getData(),
			geometryType
		};

		return geometryData;
	}

	set geometryData(value: AdditionalDetectGeometryDataType) {
		const { geometryType, parameters, position, rotation } = value;
		this._detectorType = geometryType;
		this.geometryParameters = { ...DETECT.DEFAULT_ANY, ...parameters };

		if (!(geometryType in ['Zone', 'All'])) {
			this.position.fromArray(position);
			this.rotation.fromArray(rotation);
		}

		this.tryUpdateGeometry();
	}

	get geometryParameters(): DETECT.AnyData {
		return this._geometryData;
	}

	set geometryParameters(value: DETECT.AnyData) {
		this._geometryData = { ...DETECT.DEFAULT_ANY, ...value };
		this.tryUpdateGeometry();
	}

	static maxDisplayDensity: number = 2;
	static maxSegmentsAmount: number = 40;
	autoSplitGrid: boolean = true;

	private signals: {
		objectAdded: Signal<THREE.Object3D>;
		objectChanged: Signal<THREE.Object3D>;
		objectRemoved: Signal<THREE.Object3D>;
		zoneGeometryChanged: Signal<SimulationZone>;
		zoneEmpty: Signal<SimulationZone>;
		sceneGraphChanged: Signal;
		detectGeometryAdded: Signal<Detector>;
		detectGeometryRemoved: Signal<Detector>;
		objectSelected: Signal<THREE.Object3D>;
	};

	private _geometryData: DETECT.AnyData = DETECT.DEFAULT_ANY;

	tryUpdateGeometry = () => {
		this.geometry.dispose();
		this.geometry = this.generateGeometry();
		this.geometry.computeBoundingSphere();
	};

	private generateGeometry(): THREE.BufferGeometry {
		let geometry: THREE.BufferGeometry = new THREE.BufferGeometry();
		const { geometryParameters: data, detectorType: type } = this;

		switch (type) {
			case 'Mesh':
				geometry = new THREE.BoxGeometry(
					data.width,
					data.height,
					data.depth,
					Math.min(
						data.xSegments * 2,
						Detector.maxSegmentsAmount,
						Math.max(1, Math.floor(data.width * Detector.maxDisplayDensity))
					),
					Math.min(
						data.ySegments * 2,
						Detector.maxSegmentsAmount,
						Math.max(1, Math.floor(data.height * Detector.maxDisplayDensity))
					),
					Math.min(
						data.zSegments * 2,
						Detector.maxSegmentsAmount,
						Math.max(1, Math.floor(data.depth * Detector.maxDisplayDensity))
					)
				);

				break;
			case 'Cyl':
				geometry = new HollowCylinderGeometry(
					data.innerRadius,
					data.radius,
					data.depth,
					16,
					Math.min(
						data.radialSegments * 2,
						Detector.maxSegmentsAmount,
						Math.max(1, Math.floor(data.radius * Detector.maxDisplayDensity))
					),

					Math.min(
						data.zSegments * 2,
						Detector.maxSegmentsAmount,
						Math.max(1, Math.floor(data.depth * 2 * Detector.maxDisplayDensity))
					)
				);

				break;
			case 'Zone':
				const zone = this.editor.zoneManager.getZoneByUuid(data.zoneUuid);
				geometry =
					zone?.geometry
						?.clone()
						.translate(-this.position.x, -this.position.y, -this.position.z) ??
					geometry;

				break;
			case 'All':
				break;
			default:
				throw new Error(`${type} is not a valid Detect Geometry type`);
		}

		return geometry;
	}

	constructor(
		editor: YaptideEditor,
		name: string | undefined = 'Detector',
		type: string = 'Detector',
		detectorType: DETECT.DETECTOR_TYPE = 'Mesh'
	) {
		super(editor, name, type, detectPointsMaterial.clone());

		this.signals = editor.signals;
		this.wireframeHelper = editor.detectorManager.detectorHelper;
		this._detectorType = detectorType;
		this.geometry = this.generateGeometry();

		this.signals.zoneGeometryChanged.add(zone => {
			if (zone.uuid === this._geometryData.zoneUuid) this.geometry = this.generateGeometry();
		});

		this.proxy = new Proxy<Detector>(this, this.overrideHandler);

		return this.proxy;
	}

	getMesh(): DETECT.Mesh {
		if (this.detectorType !== 'Mesh')
			throw new Error(
				`Detector of uuid=${this.uuid} is of type '${this.detectorType}' not 'Mesh'`
			);

		return new DETECT.Mesh(this._geometryData);
	}

	getCyl(): DETECT.Cyl {
		if (this.detectorType !== 'Cyl')
			throw new Error(
				`Detector of uuid=${this.uuid} is of type '${this.detectorType}' not 'Cyl'`
			);

		return new DETECT.Cyl(this._geometryData);
	}

	getZone(): DETECT.Zone {
		if (this.detectorType !== 'Zone')
			throw new Error(
				`Detector of uuid=${this.uuid} is of type '${this.detectorType}' not 'Zone'`
			);

		return new DETECT.Zone(this._geometryData);
	}

	getAll(): DETECT.All {
		if (this.detectorType !== 'All')
			throw new Error(
				`Detector of uuid=${this.uuid} is of type '${this.detectorType}' not 'All'`
			);

		return new DETECT.All(this._geometryData);
	}

	getData(type: DETECT.DETECTOR_TYPE = this.detectorType): Partial<DETECT.Any> {
		switch (type) {
			case 'Mesh':
				return this.getMesh().toJSON();
			case 'Cyl':
				return this.getCyl().toJSON();
			case 'Zone':
				return this.getZone().toJSON();
			case 'All':
			default:
				return this.getAll().toJSON();
		}
	}

	setData(data: DETECT.Any): void {
		this._geometryData = { ...this._geometryData, ...data };
		this.tryUpdateGeometry();
	}

	reset(): void {
		super.reset();
		this.setData(DETECT.DEFAULT_ANY);
	}

	toJSON(): DetectorJSON {
		const { geometryData } = this;

		return {
			...super.toJSON(),
			geometryData
		};
	}

	fromJSON(json: DetectorJSON) {
		const { geometryData } = json;
		super.fromJSON(json);
		this.geometryData = geometryData;

		return this;
	}

	duplicate(): Detector {
		throw new Error('Not implemented');
	}
}

export const isDetector = (x: unknown): x is Detector => x instanceof Detector;
