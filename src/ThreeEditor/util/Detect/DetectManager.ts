import { Signal } from 'signals';
import * as THREE from 'three';
import { Editor } from '../../js/Editor';
import * as CSG from '../CSG/CSG';
import { SimulationSceneGroup } from '../SimulationBase/SimulationGroup';
import { ISimulationObject } from '../SimulationBase/SimulationObject';
import { DetectFilter, FilterJSON } from './DetectFilter';
import { DetectGeometry, DetectGeometryJSON, isDetectGeometry } from './DetectGeometry';

interface DetectManagerJSON {
	uuid: string;
	name: string;
	detectGeometries: DetectGeometryJSON[];
	filters: FilterJSON[];
}

export class DetectContainer extends SimulationSceneGroup<DetectGeometry> {
	readonly notRemovable = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;

	children: DetectGeometry[];
	readonly isDetectContainer: true = true;
	constructor(editor: Editor) {
		super(editor, 'Detects', 'DetectGroup');
		this.children = [];
	}

	reset() {
		this.name = 'Detects';
		this.clear();
	}
}

export class FilterContainer extends SimulationSceneGroup<DetectFilter> {
	readonly notRemovable = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;

	children: DetectFilter[];
	readonly isFilterContainer: true = true;
	constructor(editor: Editor) {
		super(editor, 'Filters', 'FilterGroup');
		this.children = [];
	}

	reset() {
		this.name = 'Filters';
		this.clear();
	}
}

export class DetectManager extends THREE.Scene implements ISimulationObject {
	readonly notRemovable = true;
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

	detectContainer: DetectContainer;

	detectHelper: THREE.Mesh;

	filterContainer: FilterContainer;

	get filters() {
		return this.filterContainer.children;
	}

	private signals: {
		objectAdded: Signal<THREE.Object3D>;
		objectChanged: Signal<THREE.Object3D>;
		objectRemoved: Signal<THREE.Object3D>;
		objectSelected: Signal<THREE.Object3D>;
		zoneGeometryChanged: Signal<CSG.Zone>;
		sceneGraphChanged: Signal;
		detectGeometryAdded: Signal<DetectGeometry>;
		detectGeometryRemoved: Signal<DetectGeometry>;
		detectGeometryChanged: Signal<DetectGeometry>;
		detectFilterRemoved: Signal<DetectFilter>;
		detectFilterAdded: Signal<DetectFilter>;
		detectFilterChanged: Signal<DetectFilter>;
		materialChanged: Signal<THREE.Material>;
	};
	readonly isDetectManager: true = true;

	private editor: Editor;

	constructor(editor: Editor) {
		super();
		this.detectContainer = new DetectContainer(editor);
		this.detectHelper = new THREE.Mesh(undefined, this._detectWireMaterial);
		this.name = 'DetectManager';
		this.editor = editor;
		this.filterContainer = new FilterContainer(editor);
		this.add(this.detectContainer);
		this.add(this.detectHelper);
		this.signals = editor.signals;
		this.signals.objectSelected.add(this.onObjectSelected);
		this.signals.detectGeometryChanged.add(this.onObjectSelected);
		this.signals.materialChanged.add(this.onMaterialChanged.bind(this));
	}

	onObjectSelected = (object: THREE.Object3D) => {
		this.detectHelper.geometry.dispose();
		if (isDetectGeometry(object) && this.editor.selected === object) {
			this.detectHelper.position.copy(object.position);
			this._detectWireMaterial.color.copy(object.material.color);
			this.detectHelper.geometry = object.geometry.clone();
		} else {
			this.detectHelper.geometry = new THREE.BufferGeometry();
		}
		this.signals.sceneGraphChanged.dispatch();
	};

	onMaterialChanged() {
		if (isDetectGeometry(this.editor.selected)) {
			this._detectWireMaterial.color.copy(this.editor.selected.material.color);
		}
	}

	createGeometry(): DetectGeometry {
		const geometry = new DetectGeometry(this.editor, {});
		this.addGeometry(geometry);
		return geometry;
	}

	addGeometry(geometry: DetectGeometry): void {
		this.detectContainer.add(geometry);

		this.signals.objectAdded.dispatch(geometry);
		this.signals.detectGeometryAdded.dispatch(geometry);
		this.signals.sceneGraphChanged.dispatch();
	}

	removeGeometry(geometry: DetectGeometry): void {
		this.detectContainer.remove(geometry);
		this.signals.objectRemoved.dispatch(geometry);
		this.signals.detectGeometryRemoved.dispatch(geometry);
		this.signals.sceneGraphChanged.dispatch();
	}

	addFilter(filter: DetectFilter): void {
		filter.parent = this.filterContainer;
		this.filters.push(filter);
	}

	removeFilter(filter: DetectFilter): void {
		this.filterContainer.remove(filter);
		this.signals.detectFilterRemoved.dispatch(filter);
	}

	createFilter(): DetectFilter {
		const filter = new DetectFilter(this.editor);
		this.addFilter(filter);
		this.signals.detectFilterAdded.dispatch(filter);
		return filter;
	}

	fromJSON(data: DetectManagerJSON): void {
		if (!data) console.error('Passed empty data to load CSGManager', data);

		this.uuid = data.uuid;

		this.name = data.name;
		data.detectGeometries.forEach(geometryData => {
			this.addGeometry(DetectGeometry.fromJSON(this.editor, geometryData));
		});
		data.filters.forEach(filterData => {
			this.addFilter(DetectFilter.fromJSON(this.editor, filterData));
		});
		this.signals.detectFilterAdded.dispatch(this.filters[this.filters.length - 1]);
	}

	toJSON(): DetectManagerJSON {
		const detectGeometries = this.detectContainer.toJSON() as DetectGeometryJSON[];

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
		this.name = 'DetectManager';

		this.userData = {};
		this.background = null;
		this.environment = null;

		this.detectContainer.reset();
		this.filterContainer.reset();

		this.detectHelper.geometry.dispose();
	}

	clone(recursive: boolean) {
		return new DetectManager(this.editor).copy(this, recursive) as this;
	}

	getGeometryByUuid(uuid: string): DetectGeometry | null {
		return this.detectContainer.children.find(
			child => child.uuid === uuid
		) as DetectGeometry | null;
	}

	getFilterByUuid(uuid: string): DetectFilter | null {
		return this.filters.find(filter => filter.uuid === uuid) as DetectFilter | null;
	}

	getFilterOptions(): Record<string, string> {
		const options = this.filters.reduce((acc, filter) => {
			acc[filter.uuid] = `${filter.name} [${filter.id}]`;
			return acc;
		}, {} as Record<string, string>);
		return options;
	}

	getDetectOptions(): Record<string, string> {
		const options = this.detectContainer.children.reduce((acc, geometry) => {
			acc[geometry.uuid] = `${geometry.name} [${geometry.id}]`;
			return acc;
		}, {} as Record<string, string>);
		return options;
	}
}

export const isDetectContainer = (x: unknown): x is DetectContainer => x instanceof DetectContainer;

export const isDetectManager = (x: unknown): x is DetectManager => x instanceof DetectManager;

export const isFilterContainer = (x: unknown): x is FilterContainer => x instanceof FilterContainer;
