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
		console.log(this);
	}
}

export class DetectManager extends THREE.Scene implements ISimulationObject {
	readonly notRemovable = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;

	private static _detectWireMaterial = new THREE.MeshBasicMaterial({
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
	};
	readonly isDetectManager: true = true;

	private editor: Editor;

	constructor(editor: Editor) {
		super();
		this.detectContainer = new DetectContainer(editor);
		this.detectHelper = new THREE.Mesh(undefined, DetectManager._detectWireMaterial);
		this.name = 'DetectManager';
		this.editor = editor;
		this.filterContainer = new FilterContainer(editor);
		this.add(this.detectContainer);
		this.add(this.detectHelper);
		this.signals = editor.signals;
		this.signals.objectSelected.add(this.onObjectSelected);
		this.signals.detectGeometryChanged.add(this.onObjectSelected);
	}

	onObjectSelected = (object: THREE.Object3D) => {
		this.detectHelper.geometry.dispose();
		if (isDetectGeometry(object) && this.editor.selected === object) {
			this.detectHelper.position.copy(object.position);
			this.detectHelper.geometry = object.geometry.clone();
		} else {
			this.detectHelper.geometry = new THREE.BufferGeometry();
		}
		this.signals.sceneGraphChanged.dispatch();
	};

	createSection(): DetectGeometry {
		const section = new DetectGeometry(this.editor, {});
		this.addSection(section);
		return section;
	}

	addSection(section: DetectGeometry): void {
		this.detectContainer.add(section);

		this.signals.objectAdded.dispatch(section);
		this.signals.detectGeometryAdded.dispatch(section);
		this.signals.sceneGraphChanged.dispatch();
	}

	removeSection(section: DetectGeometry): void {
		this.detectContainer.remove(section);
		this.signals.objectRemoved.dispatch(section);
		this.signals.detectGeometryRemoved.dispatch(section);
		this.signals.sceneGraphChanged.dispatch();
	}

	addFilter(filter: DetectFilter): void {
		filter.parent = this.filterContainer;
		this.filters.push(filter);
	}

	removeFilter(filter: DetectFilter): void {
		this.filters.splice(this.filters.indexOf(filter), 1);
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
		data.detectGeometries.forEach(sectionData => {
			this.addSection(DetectGeometry.fromJSON(this.editor, sectionData));
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

	getSectionById(id: number): DetectGeometry | null {
		return this.detectContainer.children.find(
			child => child.id === id
		) as DetectGeometry | null;
	}

	getFilterByUuid(uuid: string): DetectFilter | null {
		return this.filters.find(filter => filter.uuid === uuid) as DetectFilter | null;
	}
}

export const isDetectContainer = (x: unknown): x is DetectContainer => x instanceof DetectContainer;

export const isDetectManager = (x: unknown): x is DetectManager => x instanceof DetectManager;

export const isFilterContainer = (x: unknown): x is FilterContainer => x instanceof FilterContainer;
