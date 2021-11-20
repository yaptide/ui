import { Signal } from 'signals';
import * as THREE from 'three';
import { Editor } from '../../js/Editor';
import * as CSG from '../CSG/CSG';
import { ISimulationObject } from '../SimulationObject';
import { DetectFilter, FilterJSON } from './DetectFilter';
import { DetectGeometry, DetectGeometryJSON, isDetectGeometry } from './DetectGeometry';

interface DetectManagerJSON {
	uuid: string;
	name: string;
	detectGeometries: DetectGeometryJSON[];
	filters: FilterJSON[];
}

export class DetGeoContainer extends THREE.Group implements ISimulationObject {
	readonly notRemovable = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;

	children: DetectGeometry[];
	readonly isDetectGeometryContainer: true = true;
	constructor() {
		super();
		this.name = 'Sections';
		this.children = [];
	}

	reset() {
		this.name = 'Sections';
		this.clear();
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

	detGeoContainer: DetGeoContainer;

	detectHelper: THREE.Mesh;

	filters: DetectFilter[];

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
		this.detGeoContainer = new DetGeoContainer();
		this.detectHelper = new THREE.Mesh(undefined, DetectManager._detectWireMaterial);
		this.name = 'DetectManager';
		this.editor = editor;
		this.filters = [];
		this.add(this.detGeoContainer);
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
		this.detGeoContainer.add(section);

		this.signals.objectAdded.dispatch(section);
		this.signals.detectGeometryAdded.dispatch(section);
		this.signals.sceneGraphChanged.dispatch();
	}

	removeSection(section: DetectGeometry): void {
		this.detGeoContainer.remove(section);
		this.signals.objectRemoved.dispatch(section);
		this.signals.detectGeometryRemoved.dispatch(section);
		this.signals.sceneGraphChanged.dispatch();
	}

	addFilter(filter: DetectFilter): void {
		this.filters.push(filter);
	}

	removeFilter(filter: DetectFilter): void {
		this.filters = this.filters.filter(f => f.uuid !== filter.uuid);
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
		const detectGeometries = this.detGeoContainer.children.map(section => section.toJSON());

		const filters = this.filters.map(filter => filter.toJSON());

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

		this.detGeoContainer.reset();
		this.clear();

		this.detectHelper.geometry.dispose();
	}

	clear(): this {
		this.filters.forEach(filter => {
			this.removeFilter(filter);
		});
		return this;
	}

	clone(recursive: boolean) {
		return new DetectManager(this.editor).copy(this, recursive) as this;
	}

	getSectionById(id: number): DetectGeometry | null {
		return this.detGeoContainer.children.find(
			child => child.id === id
		) as DetectGeometry | null;
	}

	getFilterByUuid(uuid: string): DetectFilter | null {
		return this.filters.find(filter => filter.uuid === uuid) as DetectFilter | null;
	}
}
