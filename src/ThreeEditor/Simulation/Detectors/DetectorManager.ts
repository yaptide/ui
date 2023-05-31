import { Signal } from 'signals';
import * as THREE from 'three';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationSceneContainer } from '../Base/SimulationContainer';
import { SimulationElementManager } from '../Base/SimulationManager';
import { SimulationZone } from '../Base/SimulationZone';
import { Detector, DetectorJSON, isDetectGeometry } from './Detector';

interface DetectorManagerJSON {
	uuid: string;
	name: string;
	detectGeometries: DetectorJSON[];
}

export class DetectorContainer extends SimulationSceneContainer<Detector> {
	children: Detector[];
	readonly isDetectContainer: true = true;
	constructor(editor: YaptideEditor) {
		super(editor, 'Detects', 'DetectGroup', json => new Detector(editor).fromJSON(json));
		this.children = [];
	}

	reset() {
		this.name = 'Detects';
		this.clear();
	}
}

export class DetectorManager
	extends THREE.Scene
	implements SimulationPropertiesType, SimulationElementManager<'detector', Detector>
{
	readonly notRemovable: boolean = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;

	private _detectWireMaterial = new THREE.MeshBasicMaterial({
		side: THREE.DoubleSide,
		transparent: true,
		opacity: 0.5,
		wireframe: true,
		color: new THREE.Color('cyan')
	});

	detectorContainer: DetectorContainer;

	detectHelper: THREE.Mesh;

	get detectors() {
		return this.detectorContainer.children;
	}

	private signals: {
		objectAdded: Signal<THREE.Object3D>;
		objectChanged: Signal<THREE.Object3D>;
		objectRemoved: Signal<THREE.Object3D>;
		objectSelected: Signal<THREE.Object3D>;
		zoneGeometryChanged: Signal<SimulationZone>;
		sceneGraphChanged: Signal;
		detectGeometryAdded: Signal<Detector>;
		detectGeometryRemoved: Signal<Detector>;
		detectGeometryChanged: Signal<Detector>;
		materialChanged: Signal<THREE.Material>;
	};
	readonly isDetectorManager: true = true;

	private editor: YaptideEditor;

	constructor(editor: YaptideEditor) {
		super();
		this.detectorContainer = new DetectorContainer(editor);
		this.detectHelper = new THREE.Mesh(undefined, this._detectWireMaterial);
		this.detectHelper.visible = false;
		this.name = 'DetectorManager';
		this.editor = editor;

		this.add(this.detectorContainer);
		this.add(this.detectHelper);

		this.signals = editor.signals;
		this.signals.objectSelected.add(this.onObjectSelected);
		this.signals.detectGeometryChanged.add(this.onObjectSelected);
		this.signals.materialChanged.add(this.onMaterialChanged.bind(this));
	}

	private hasUsefulGeometry(object: THREE.Object3D): object is Detector {
		return Boolean(
			isDetectGeometry(object) &&
				this.editor.selected === object &&
				object.geometry &&
				object.geometry.boundingSphere &&
				object.geometry.boundingSphere.radius > 0
		);
	}

	onObjectSelected = (object: THREE.Object3D) => {
		this.detectHelper.geometry.dispose();
		this.detectHelper.geometry = new THREE.BufferGeometry();
		this.detectHelper.visible = false;

		if (!this.hasUsefulGeometry(object)) return;
		this.detectHelper.position.copy(object.position);
		this._detectWireMaterial.color.copy(object.material.color);
		this.detectHelper.geometry = object.geometry.clone();
		this.detectHelper.visible = object.visible;

		this.signals.sceneGraphChanged.dispatch();
	};

	onMaterialChanged() {
		if (isDetectGeometry(this.editor.selected)) {
			this._detectWireMaterial.color.copy(this.editor.selected.material.color);
		}
	}

	createDetector(): Detector {
		const geometry = new Detector(this.editor);
		this.addDetector(geometry);
		return geometry;
	}

	addDetector(geometry: Detector): void {
		this.detectorContainer.add(geometry);
		this.editor.select(geometry);
		this.signals.detectGeometryAdded.dispatch(geometry);
	}

	removeDetector(geometry: Detector): void {
		this.detectorContainer.remove(geometry);
		this.editor.deselect();
		this.signals.detectGeometryRemoved.dispatch(geometry);
	}

	fromJSON(data: DetectorManagerJSON): void {
		if (!data) console.error('Passed empty data to load CSGManager', data);

		this.uuid = data.uuid;

		this.name = data.name;
		data.detectGeometries.forEach(geometryData => {
			this.addDetector(new Detector(this.editor).fromJSON(geometryData));
		});
	}

	toJSON(): DetectorManagerJSON {
		const detectGeometries = this.detectorContainer.toJSON() as DetectorJSON[];

		const { uuid, name } = this;

		return {
			uuid,
			name,
			detectGeometries
		};
	}

	reset(): void {
		this.name = 'DetectorManager';

		this.userData = {};
		this.background = null;
		this.environment = null;

		this.detectorContainer.reset();

		this.detectHelper.geometry.dispose();
	}

	clone(recursive: boolean) {
		return new DetectorManager(this.editor).copy(this, recursive) as this;
	}

	getDetectorByUuid(uuid: string): Detector | null {
		return this.detectors.find(child => child.uuid === uuid) as Detector | null;
	}

	getDetectorByName(name: string) {
		return this.detectors.find(child => child.name === name) as Detector | null;
	}

	getDetectOptions(
		additionalPredicate?: (value: Detector, index: number, array: Detector[]) => boolean
	): Record<string, string> {
		const options = this.detectors
			.filter(({ detectorType: detectType, geometryData }) => {
				if (detectType !== 'Zone') return true;
				return this.editor.zoneManager.getZoneByUuid(geometryData.zoneUuid) !== undefined;
			})
			.filter(additionalPredicate || (() => true))
			.reduce((acc, geometry) => {
				acc[geometry.uuid] = `${geometry.name} [${geometry.id}]`;
				return acc;
			}, {} as Record<string, string>);
		return options;
	}
}

export const isDetectContainer = (x: unknown): x is DetectorContainer =>
	x instanceof DetectorContainer;

export const isDetectorManager = (x: unknown): x is DetectorManager => x instanceof DetectorManager;
