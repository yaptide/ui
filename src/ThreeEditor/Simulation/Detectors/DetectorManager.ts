import { Signal } from 'signals';
import * as THREE from 'three';
import { YaptideEditor } from '../../js/Editor';
import { SimulationSceneContainer } from '../Base/SimulationContainer';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { DetectFilter, FilterJSON } from '../Scoring/DetectFilter';
import { Detector, DetectGeometryJSON, isDetectGeometry } from './Detector';
import { SimulationZone } from '../Base/SimZone';

interface DetectorManagerJSON {
	uuid: string;
	name: string;
	detectGeometries: DetectGeometryJSON[];
	filters: FilterJSON[];
}

export class DetectorContainer extends SimulationSceneContainer<Detector> {
	readonly notRemovable: boolean = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;

	children: Detector[];
	readonly isDetectContainer: true = true;
	constructor(editor: YaptideEditor) {
		super(editor, 'Detects', 'DetectGroup');
		this.children = [];
	}

	reset() {
		this.name = 'Detects';
		this.clear();
	}
}

export class FilterContainer extends SimulationSceneContainer<DetectFilter> {
	readonly notRemovable: boolean = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly notHidable = true;

	children: DetectFilter[];
	readonly isFilterContainer: true = true;
	constructor(editor: YaptideEditor) {
		super(editor, 'Filters', 'FilterGroup');
		this.children = [];
	}

	reset() {
		this.name = 'Filters';
		this.clear();
	}
}

export class DetectorManager extends THREE.Scene implements SimulationPropertiesType {
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

	filterContainer: FilterContainer;

	get filters() {
		return this.filterContainer.children;
	}
	get detects() {
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
		detectFilterRemoved: Signal<DetectFilter>;
		detectFilterAdded: Signal<DetectFilter>;
		detectFilterChanged: Signal<DetectFilter>;
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
		this.filterContainer = new FilterContainer(editor);

		this.add(this.detectorContainer);
		this.add(this.filterContainer);
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
		const geometry = new Detector(this.editor, {});
		this.addDetector(geometry);
		return geometry;
	}

	addDetector(geometry: Detector): void {
		this.detectorContainer.add(geometry);
		this.editor.select(geometry);
		this.signals.detectGeometryAdded.dispatch(geometry);
	}

	getDetectorByUuid(uuid: string) {
		return this.detectorContainer.children.find(child => child.uuid === uuid) ?? null;
	}

	getDetectorByName(name: string) {
		return this.detectorContainer.children.find(child => child.name === name) ?? null;
	}

	removeDetector(geometry: Detector): void {
		this.detectorContainer.remove(geometry);
		this.editor.deselect();
		this.signals.detectGeometryRemoved.dispatch(geometry);
	}

	addFilter(filter: DetectFilter): void {
		this.filterContainer.add(filter);
		this.editor.select(filter);
		this.signals.detectFilterAdded.dispatch(filter);
	}

	removeFilter(filter: DetectFilter): void {
		this.filterContainer.remove(filter);
		this.editor.deselect();
		this.signals.detectFilterRemoved.dispatch(filter);
	}

	createFilter(): DetectFilter {
		const filter = new DetectFilter(this.editor);
		this.addFilter(filter);
		return filter;
	}

	getFilterByName(name: string) {
		return this.filters.find(filter => filter.name === name) ?? null;
	}

	getFilterByUuid(uuid: string) {
		return this.filters.find(filter => filter.uuid === uuid) ?? null;
	}

	fromJSON(data: DetectorManagerJSON): void {
		if (!data) console.error('Passed empty data to load CSGManager', data);

		this.uuid = data.uuid;

		this.name = data.name;
		data.detectGeometries.forEach(geometryData => {
			this.addDetector(Detector.fromJSON(this.editor, geometryData));
		});
		data.filters.forEach(filterData => {
			this.addFilter(DetectFilter.fromJSON(this.editor, filterData));
		});
		this.signals.detectFilterAdded.dispatch(this.filters[this.filters.length - 1]);
	}

	toJSON(): DetectorManagerJSON {
		const detectGeometries = this.detectorContainer.toJSON() as DetectGeometryJSON[];

		const filters = this.filterContainer.toJSON() as FilterJSON[];

		const { uuid, name } = this;

		return {
			uuid,
			name,
			detectGeometries,
			filters
		};
	}

	reset(): void {
		this.name = 'DetectorManager';

		this.userData = {};
		this.background = null;
		this.environment = null;

		this.detectorContainer.reset();
		this.filterContainer.reset();

		this.detectHelper.geometry.dispose();
	}

	clone(recursive: boolean) {
		return new DetectorManager(this.editor).copy(this, recursive) as this;
	}

	getGeometryByUuid(uuid: string): Detector | null {
		return this.detectorContainer.children.find(
			child => child.uuid === uuid
		) as Detector | null;
	}

	getGeometryByName(name: string) {
		return this.detectorContainer.children.find(
			child => child.name === name
		) as Detector | null;
	}

	getFilterOptions(): Record<string, string> {
		const options = this.filters
			.filter(filter => {
				return filter.rules.length;
			})
			.reduce((acc, filter) => {
				acc[filter.uuid] = `${filter.name} [${filter.id}]`;
				return acc;
			}, {} as Record<string, string>);
		return options;
	}

	getDetectOptions(
		additionalPredicate?: (value: Detector, index: number, array: Detector[]) => boolean
	): Record<string, string> {
		const options = this.detects
			.filter(({ detectType, geometryData }) => {
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

export const isFilterContainer = (x: unknown): x is FilterContainer => x instanceof FilterContainer;
