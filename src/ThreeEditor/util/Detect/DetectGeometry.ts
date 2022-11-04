import { Signal } from 'signals';
import * as THREE from 'three';
import { Editor } from '../../js/Editor';
import * as CSG from '../CSG/CSG';
import { SimulationPoints } from '../SimulationBase/SimulationMesh';
import { DetectManager } from './DetectManager';
import * as DETECT from './DetectTypes';

export interface DetectGeometryJSON {
	uuid: string;
	data: DETECT.Any;
	type: DETECT.DETECT_TYPE;
	position: THREE.Vector3Tuple;
	name: string;
	colorHex: number;
}

type DetectGeometryArgs = Partial<DetectGeometryJSON>;

export class DetectGeometry extends SimulationPoints {
	readonly notRemovable: boolean = false;
	map: null;
	alphaMap: null;
	size: number;
	sizeAttenuation: boolean;
	get notMovable() {
		// custom get function to conditionally return notMoveable property;
		return ['Zone', 'All'].includes(this.detectType);
	}

	get zone(): CSG.Zone | null {
		const data = this.getData();
		if (data.zoneUuid) return this.editor.zoneManager.getZoneByUuid(data.zoneUuid) ?? null;
		else return null;
	}
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly isDetectGeometry: true = true;

	private positionProxy: THREE.Vector3;
	private proxy: DetectGeometry;
	private _detectType: DETECT.DETECT_TYPE;

	get detectType(): DETECT.DETECT_TYPE {
		return this._detectType;
	}

	set detectType(value: DETECT.DETECT_TYPE) {
		this._detectType = value;
		this.tryUpdateGeometry();
		this.signals.objectChanged.dispatch(this.proxy, 'detectType' as any);
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
		zoneGeometryChanged: Signal<CSG.Zone>;
		zoneEmpty: Signal<CSG.Zone>;
		sceneGraphChanged: Signal;
		CSGManagerStateChanged: Signal;
		detectGeometryAdded: Signal<DetectGeometry>;
		detectGeometryRemoved: Signal<DetectGeometry>;
		detectGeometryChanged: Signal<DetectGeometry>;
		objectSelected: Signal<THREE.Object3D>;
	};
	readonly isDetectGeo: true = true;

	private _geometryData: DETECT.AnyData;

	private tryUpdateGeometry = (type: DETECT.DETECT_TYPE = this.detectType) => {
		this.geometry.dispose();
		this.geometry = this.generateGeometry(undefined, type);
		this.geometry.computeBoundingSphere();
	};

	private overrideHandler = {
		get: (target: DetectGeometry, p: keyof DetectGeometry) => {
			let result: unknown;
			switch (p) {
				case 'position':
					result = this.positionProxy;
					break;
				default:
					result = Reflect.get(target, p);
			}
			return result;
		},
		set: (
			target: DetectGeometry,
			p: keyof DetectGeometry,
			value: unknown,
			receiver: unknown
		) => {
			const result = Reflect.set(target, p, value, receiver);
			switch (p) {
				case 'geometry':
					this.geometry.computeBoundingSphere();
					this.updateMatrixWorld(true);
					break;
				default:
					break;
			}
			return result;
		}
	};

	private generateGeometry(
		data: DETECT.AnyData = this.geometryData,
		type: DETECT.DETECT_TYPE = this.detectType
	): THREE.BufferGeometry {
		let geometry: THREE.BufferGeometry = new THREE.BufferGeometry();

		switch (type) {
			case 'Mesh':
				geometry = new THREE.BoxGeometry(
					data.width,
					data.height,
					data.depth,
					Math.min(
						DetectGeometry.maxSegmentsAmount,
						Math.max(1, Math.floor(data.width * DetectGeometry.maxDisplayDensity))
					),
					Math.min(
						DetectGeometry.maxSegmentsAmount,
						Math.max(1, Math.floor(data.height * DetectGeometry.maxDisplayDensity))
					),
					Math.min(
						DetectGeometry.maxSegmentsAmount,
						Math.max(1, Math.floor(data.depth * DetectGeometry.maxDisplayDensity))
					)
				);
				break;
			case 'Cyl':
				geometry = createCylindricalGeometry(data, new THREE.Matrix4());
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
		editor: Editor,
		{ data = {}, type = 'Mesh', position = [0, 0, 0], name }: DetectGeometryArgs
	) {
		super(editor, name, 'Detect');
		this.map = null;

		this.alphaMap = null;

		this.size = 1;
		this.sizeAttenuation = true;
		this.proxy = new Proxy(this, this.overrideHandler);
		this.signals = editor.signals;
		this.position.fromArray(position);
		this._geometryData = { ...DETECT.DEFAULT_ANY, ...data };
		this._detectType = type;

		this.positionProxy = new Proxy(this.position, {
			get: (target: THREE.Vector3, p: keyof THREE.Vector3) => {
				const scope = this;
				const parent: DetectManager | undefined = this.parent?.parent as
					| DetectManager
					| undefined;
				switch (p) {
					case 'copy':
						return function (v: THREE.Vector3) {
							target[p].apply(target, [v]);
							return scope.positionProxy;
						};
					case 'add':
						if (parent)
							return function (v: THREE.Vector3) {
								const nV = target[p].apply(target, [v]);
								parent.detectHelper.position.copy(nV);
								return nV;
							};
						return Reflect.get(target, p);
					default:
						return Reflect.get(target, p);
				}
			}
		});

		this.geometry = this.generateGeometry(this._geometryData, type);
		this.signals.zoneGeometryChanged.add(zone => {
			if (zone.uuid === this._geometryData.zoneUuid) this.geometry = this.generateGeometry();
		});

		return this.proxy;
	}

	getMesh(): DETECT.Mesh {
		if (this.detectType !== 'Mesh')
			throw new Error(`DetectGeo of uuid=${this.uuid} isn't of 'Mesh' type`);
		return new DETECT.Mesh(this._geometryData);
	}

	getCyl(): DETECT.Cyl {
		if (this.detectType !== 'Cyl')
			throw new Error(`DetectGeo of uuid=${this.uuid} isn't of 'Cyl' type`);
		return new DETECT.Cyl(this._geometryData);
	}

	getZone(): DETECT.Zone {
		if (this.detectType !== 'Zone')
			throw new Error(`DetectGeo of uuid=${this.uuid} isn't of 'Zone' type`);
		return new DETECT.Zone(this._geometryData);
	}

	getAll(): DETECT.All {
		if (this.detectType !== 'All')
			throw new Error(`DetectGeo of uuid=${this.uuid} isn't of 'All' type`);
		return new DETECT.All(this._geometryData);
	}

	getData(type: DETECT.DETECT_TYPE = this.detectType): Partial<DETECT.Any> {
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

	copy(source: this, recursive = true) {
		return new Proxy(super.copy(source, recursive), this.overrideHandler) as this;
	}

	toJSON(): DetectGeometryJSON {
		const data = this.getData();
		const type = this.detectType;
		const position = this.position.toArray();
		const name = this.name;
		const colorHex = this.material.color.getHex();
		const uuid = this.uuid;
		return {
			uuid,
			data,
			type,
			position,
			name,
			colorHex
		};
	}

	fromJSON(data: DetectGeometryJSON): DetectGeometry {
		this._geometryData = { ...DETECT.DEFAULT_ANY, ...data.data };
		this.uuid = data.uuid;
		this.detectType = data.type;
		this.name = data.name;
		this.geometry = this.generateGeometry();
		this.position.fromArray(data.position);
		this.material.color.setHex(data.colorHex);
		return this;
	}

	static fromJSON(editor: Editor, data: DetectGeometryJSON): DetectGeometry {
		return new DetectGeometry(editor, data).fromJSON(data);
	}
}

export const isDetectGeometry = (x: unknown): x is DetectGeometry => x instanceof DetectGeometry;

function createCylindricalGeometry(data: DETECT.CylData, matrix: THREE.Matrix4) {
	const geometry1 = new THREE.CylinderGeometry(
		data.radius,
		data.radius,
		data.depth,
		Math.min(
			DetectGeometry.maxSegmentsAmount,
			Math.max(10, Math.floor(Math.PI * data.radius * DetectGeometry.maxDisplayDensity))
		),
		Math.min(
			DetectGeometry.maxSegmentsAmount,
			Math.max(1, Math.floor(data.depth * DetectGeometry.maxDisplayDensity))
		)
	);
	const geometry2 = new THREE.BoxGeometry(
		data.radius * 2,
		data.depth,
		data.radius * 2,
		Math.min(
			DetectGeometry.maxSegmentsAmount,
			Math.max(2, Math.floor(data.radius * 2 * DetectGeometry.maxDisplayDensity))
		),
		Math.min(
			DetectGeometry.maxSegmentsAmount,
			Math.max(2, Math.floor(data.depth * DetectGeometry.maxDisplayDensity))
		),
		Math.min(
			DetectGeometry.maxSegmentsAmount,
			Math.max(2, Math.floor(data.radius * 2 * DetectGeometry.maxDisplayDensity))
		)
	);

	const geometry3 = new THREE.CylinderGeometry(
		Math.min(data.innerRadius, data.radius - 1e-4),
		Math.min(data.innerRadius, data.radius - 1e-4),
		data.depth,
		Math.min(
			DetectGeometry.maxSegmentsAmount,
			Math.max(10, Math.floor(Math.PI * data.innerRadius * DetectGeometry.maxDisplayDensity))
		),
		Math.min(
			DetectGeometry.maxSegmentsAmount,
			Math.max(1, Math.floor(data.depth * DetectGeometry.maxDisplayDensity))
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
