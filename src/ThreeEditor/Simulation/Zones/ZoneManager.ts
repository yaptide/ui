import * as Comlink from 'comlink';
import { Signal } from 'signals';
import * as THREE from 'three';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { SimulationSceneContainer } from '../Base/SimulationScene';
import { Editor } from '../../js/Editor';
import { WorldZone, WorldZoneJSON } from './WorldZone/WorldZone';
import { BooleanZone, BooleanZoneJSON } from './BooleanZone';
import { ZoneWorker } from '../../CSG/CSGWorker';

interface ZoneManagerJSON {
	uuid: string;
	name: string;
	zones: BooleanZoneJSON[];
	worldZone: WorldZoneJSON;
}

export class ZoneContainer extends SimulationSceneContainer<BooleanZone> {
	readonly notRemovable: boolean = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;

	readonly isZoneContainer: true = true;
	constructor(editor: Editor) {
		super(editor, 'Zones', 'ZoneGroup');
	}
	reset() {
		this.children.forEach(({ simulationMaterial }) => simulationMaterial.decrement());
		super.reset();
	}
	remove(zone: BooleanZone): this {
		zone.simulationMaterial.decrement();
		return super.remove(zone);
	}
}

export class ZoneManager extends THREE.Scene implements SimulationPropertiesType {
	readonly notRemovable: boolean = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;

	editor: Editor;
	worker: Comlink.Remote<ZoneWorker>;
	worldZone: WorldZone;
	zoneContainer: ZoneContainer;

	private signals: {
		objectAdded: Signal<THREE.Object3D>;
		zoneAdded: Signal<BooleanZone>;
		zoneEmpty: Signal<BooleanZone>;
		objectRemoved: Signal<THREE.Object3D>;
		zoneRemoved: Signal<BooleanZone>;
		sceneGraphChanged: Signal;
		CSGManagerStateChanged: Signal;
	};

	readonly isZoneManager: true = true;

	constructor(editor: Editor) {
		super();
		this.name = 'ZoneManager';
		this.zoneContainer = new ZoneContainer(editor);
		const light = new THREE.HemisphereLight(0xffffff, 0x222222, 1);
		light.position.set(15, 15, 15);
		this.add(light);
		this.add(this.zoneContainer);
		this.worker = Comlink.wrap<ZoneWorker>(
			new Worker(new URL('../../CSG/CSGWorker.ts', import.meta.url))
		);
		this.editor = editor;
		this.signals = editor.signals;

		this.worldZone = new WorldZone(editor);
		this.worldZone.addHelpersToSceneHelpers();
		this.worldZone.name = 'World Zone';

		this.add(this.worldZone);

		this.signals.zoneEmpty.add((zone: BooleanZone) => this.handleZoneEmpty(zone));
	}

	createZone() {
		const zone = new BooleanZone(this.editor);
		this.addZone(zone);
		return zone;
	}

	addZone(zone: BooleanZone): void {
		zone.worker = this.worker;
		this.zoneContainer.add(zone);

		this.signals.objectAdded.dispatch(zone);
		this.signals.zoneAdded.dispatch(zone);
		this.signals.sceneGraphChanged.dispatch();
		this.signals.CSGManagerStateChanged.dispatch();
	}

	removeZone(zone: BooleanZone): void {
		this.zoneContainer.remove(zone);

		this.signals.objectRemoved.dispatch(zone);
		this.signals.zoneRemoved.dispatch(zone);
		this.signals.sceneGraphChanged.dispatch();
		this.signals.CSGManagerStateChanged.dispatch();
	}

	toJSON() {
		const zones = this.zoneContainer.toJSON();
		const uuid = this.uuid;
		const name = this.name;
		const worldZone = this.worldZone.toJSON();
		return {
			zones,
			uuid,
			name,
			worldZone
		};
	}

	fromJSON(data: ZoneManagerJSON) {
		if (!data) {
			console.error('Passed empty data to load CSGManager', data);
			return this;
		}

		this.uuid = data.uuid;

		this.name = data.name;

		data.zones.forEach(zone => {
			this.addZone(BooleanZone.fromJSON(this.editor, zone));
		});

		this.worldZone.removeHelpersFromSceneHelpers();
		this.remove(this.worldZone);
		this.worldZone.fromJSON(data.worldZone);
		this.add(this.worldZone);
		this.worldZone.addHelpersToSceneHelpers();

		return this;
	}

	static fromJSON(editor: Editor, data: ZoneManagerJSON) {
		return new ZoneManager(editor).fromJSON(data);
	}

	reset() {
		this.name = 'Zones';
		this.zoneContainer.reset();
		this.worldZone.reset();
		return this;
	}

	getObjectById(id: number) {
		return this.worldZone.getObjectById(id) ?? super.getObjectById(id);
	}

	getZoneById(id: number): BooleanZone | undefined {
		return this.zoneContainer.children.find((zone: BooleanZone) => zone.id === id);
	}

	getZoneByUuid(uuid: string): BooleanZone | undefined {
		return this.zoneContainer.children.find((zone: BooleanZone) => zone.uuid === uuid);
	}

	handleZoneEmpty(zone: BooleanZone): void {
		this.removeZone(zone);
	}

	getZoneOptions(): Record<string, string> {
		const zoneOptions = this.zoneContainer.children.reduce((acc, zone: BooleanZone) => {
			acc[zone.uuid] = `${zone.name} [${zone.id}]`;
			return acc;
		}, {} as Record<string, string>);
		return zoneOptions;
	}
}

export const isZoneContainer = (x: unknown): x is ZoneContainer => x instanceof ZoneContainer;

export const isZoneManager = (x: unknown): x is ZoneManager => x instanceof ZoneManager;