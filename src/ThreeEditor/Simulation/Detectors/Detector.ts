import { Signal } from 'signals';
import * as THREE from 'three';
import * as DETECT from '../../../types/DetectTypes';
import { AdditionalGeometryDataType, getGeometryData } from '../../../util/AdditionalGeometryData';
import * as CSG from '../../CSG/CSG';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationPoints, SimulationPointsJSON } from '../Base/SimulationPoints';
import { SimulationZone } from '../Base/SimulationZone';
import { HollowCylinderGeometry } from './HollowCylinderGeometry';

type AdditionalDetectGeometryDataType = Omit<
	AdditionalGeometryDataType & {
		parameters: DETECT.Any;
		geometryType: DETECT.DETECTOR_TYPE;
	},
	never
>;

export type DetectorJSON = Omit<
	SimulationPointsJSON & {
		geometryData: AdditionalDetectGeometryDataType;
	},
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
	pointsHelper: THREE.Mesh;

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
	readonly isDetectGeometry: true = true;
	private _detectorType: DETECT.DETECTOR_TYPE;
	private proxy: Detector;

	get detectorType(): DETECT.DETECTOR_TYPE {
		return this._detectorType;
	}

	set detectorType(value: DETECT.DETECTOR_TYPE) {
		this._detectorType = value;
		this.tryUpdateGeometry();
	}

	get geometryData(): DETECT.AnyData {
		return this._geometryData;
	}

	set geometryData(value: DETECT.AnyData) {
		this._geometryData = value;
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
	readonly isDetectGeo: true = true;

	private _geometryData: DETECT.AnyData = DETECT.DEFAULT_ANY;

	private tryUpdateGeometry = (type: DETECT.DETECTOR_TYPE = this.detectorType) => {
		this.geometry.dispose();
		this.geometry = this.generateGeometry(undefined, type);
		this.geometry.computeBoundingSphere();
	};

	reset(): void {
		throw new Error('Method not implemented.');
	}

	private generateGeometry(
		data: DETECT.AnyData = this.geometryData,
		type: DETECT.DETECTOR_TYPE = this.detectorType
	): THREE.BufferGeometry {
		let geometry: THREE.BufferGeometry = new THREE.BufferGeometry();

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
		console.log('Detector constructor', this.material);
		this.signals = editor.signals;
		this.pointsHelper = editor.detectorManager.detectHelper;
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
			throw new Error(`DetectGeo of uuid=${this.uuid} isn't of 'Mesh' type`);
		return new DETECT.Mesh(this._geometryData);
	}

	getCyl(): DETECT.Cyl {
		if (this.detectorType !== 'Cyl')
			throw new Error(`DetectGeo of uuid=${this.uuid} isn't of 'Cyl' type`);
		return new DETECT.Cyl(this._geometryData);
	}

	getZone(): DETECT.Zone {
		if (this.detectorType !== 'Zone')
			throw new Error(`DetectGeo of uuid=${this.uuid} isn't of 'Zone' type`);
		return new DETECT.Zone(this._geometryData);
	}

	getAll(): DETECT.All {
		if (this.detectorType !== 'All')
			throw new Error(`DetectGeo of uuid=${this.uuid} isn't of 'All' type`);
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

	toJSON(): DetectorJSON {
		const partialData = getGeometryData(this);
		const geometryType = this.detectorType;
		const geometryData: AdditionalDetectGeometryDataType = {
			...partialData,
			parameters: this.getData(),
			geometryType
		};
		return {
			...super.toJSON(),
			geometryData
		};
	}

	fromJSON(data: DetectorJSON) {
		const { geometryData, ...pointsJSON } = data;
		super.fromJSON(pointsJSON);
		this.reconstructGeometryFromData(geometryData);
		return this;
	}

	reconstructGeometryFromData(data: AdditionalDetectGeometryDataType): void {
		const { geometryType, ...detectGeometryData } = data;
		this._geometryData = { ...DETECT.DEFAULT_ANY, ...detectGeometryData };
		this.detectorType = geometryType;
		this.geometry = this.generateGeometry();
	}
}

export const isDetectGeometry = (x: unknown): x is Detector => x instanceof Detector;

/**
 * @deprecated
 */
function createCylindricalGeometry(data: DETECT.CylData, matrix: THREE.Matrix4) {
	const geometry1 = new THREE.CylinderGeometry(
		data.radius,
		data.radius,
		data.depth,
		Math.min(
			Detector.maxSegmentsAmount,
			Math.max(10, Math.floor(Math.PI * data.radius * Detector.maxDisplayDensity))
		),
		Math.min(
			Detector.maxSegmentsAmount,
			Math.max(1, Math.floor(data.depth * Detector.maxDisplayDensity))
		)
	);
	const geometry2 = new THREE.BoxGeometry(
		data.radius * 2,
		data.depth,
		data.radius * 2,
		Math.min(
			Detector.maxSegmentsAmount,
			Math.max(2, Math.floor(data.radius * 2 * Detector.maxDisplayDensity))
		),
		Math.min(
			Detector.maxSegmentsAmount,
			Math.max(2, Math.floor(data.depth * Detector.maxDisplayDensity))
		),
		Math.min(
			Detector.maxSegmentsAmount,
			Math.max(2, Math.floor(data.radius * 2 * Detector.maxDisplayDensity))
		)
	);

	const geometry3 = new THREE.CylinderGeometry(
		Math.min(data.innerRadius, data.radius - 1e-4),
		Math.min(data.innerRadius, data.radius - 1e-4),
		data.depth,
		Math.min(
			Detector.maxSegmentsAmount,
			Math.max(10, Math.floor(Math.PI * data.innerRadius * Detector.maxDisplayDensity))
		),
		Math.min(
			Detector.maxSegmentsAmount,
			Math.max(1, Math.floor(data.depth * Detector.maxDisplayDensity))
		)
	);
	const cyl1 = new THREE.Mesh(geometry1);
	const cyl2 = new THREE.Mesh(geometry2);
	const cyl3 = new THREE.Mesh(geometry3);
	cyl1.updateMatrix();
	cyl2.updateMatrix();
	cyl3.updateMatrix();
	const BSP1 = CSG.CSG.fromMesh(cyl1);
	const BSP2 = CSG.CSG.fromMesh(cyl2);
	const BSP3 = CSG.CSG.fromMesh(cyl3);
	const newGeometry = CSG.CSG.toGeometry(
		data.innerRadius ? BSP2.intersect(BSP1).subtract(BSP3) : BSP2.intersect(BSP1),
		matrix
	);
	return newGeometry.rotateX(Math.PI / 2); // rotate to align along the z axis
}
