import * as Comlink from 'comlink';
import { Signal } from 'signals';
import * as THREE from 'three';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { SimulationSceneContainer } from '../Base/SimulationContainer';
import { YaptideEditor } from '../../js/YaptideEditor';
import { WorldZone, WorldZoneJSON } from './WorldZone/WorldZone';
import { BooleanZone, BooleanZoneJSON, isBooleanZone } from './BooleanZone';
import { ZoneWorker } from '../../CSG/CSGWorker';
import { SimulationZone, SimulationZoneJSON } from '../Base/SimulationZone';
import { SimulationElementManager } from '../Base/SimulationManager';

interface ZoneManagerJSON {
	uuid: string;
	name: string;
	zones: BooleanZoneJSON[];
	worldZone: WorldZoneJSON;
}

export class ZoneContainer extends SimulationSceneContainer<SimulationZone> {
	readonly isZoneContainer: true = true;
	constructor(editor: YaptideEditor) {
		super(editor, 'Zones', 'ZoneGroup', (zone: SimulationZoneJSON) => {
			if (zone.type === 'BooleanZone')
				return BooleanZone.fromJSON(editor, zone as BooleanZoneJSON);
			throw new Error(`Unknown zone type ${zone.type}`);
		});
	}
	reset() {
		this.children.forEach(({ simulationMaterial }) => simulationMaterial.decrement());
		super.reset();
	}
	remove(zone: SimulationZone): this {
		zone.simulationMaterial.decrement();
		return super.remove(zone);
	}
}

export class ZoneManager
	extends THREE.Scene
	implements SimulationPropertiesType, SimulationElementManager<'zone', SimulationZone>
{
	readonly notRemovable: boolean = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;

	editor: YaptideEditor;
	worker: Comlink.Remote<ZoneWorker>;
	worldZone: WorldZone;
	zoneContainer: ZoneContainer;

	get zones() {
		return this.zoneContainer.children;
	}

	private signals: {
		objectAdded: Signal<THREE.Object3D>;
		zoneAdded: Signal<SimulationZone>;
		zoneEmpty: Signal<BooleanZone>;
		objectRemoved: Signal<THREE.Object3D>;
		zoneRemoved: Signal<SimulationZone>;
		sceneGraphChanged: Signal;
	};

	readonly isZoneManager: true = true;

	constructor(editor: YaptideEditor) {
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

	addZone(zone: SimulationZone): void {
		if (isBooleanZone(zone)) zone.worker = this.worker;
		this.zoneContainer.add(zone);
		this.editor.select(zone);

		this.signals.objectAdded.dispatch(zone);
		this.signals.zoneAdded.dispatch(zone);
		this.signals.sceneGraphChanged.dispatch();
	}

	removeZone(zone: SimulationZone): void {
		this.zoneContainer.remove(zone);
		this.editor.deselect();

		this.signals.objectRemoved.dispatch(zone);
		this.signals.zoneRemoved.dispatch(zone);
		this.signals.sceneGraphChanged.dispatch();
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

	static fromJSON(editor: YaptideEditor, data: ZoneManagerJSON) {
		return new ZoneManager(editor).fromJSON(data);
	}

	reset() {
		this.name = 'Zones';
		this.zoneContainer.reset();
		this.worldZone.reset();
		return this;
	}

	/**
	 * @deprecated
	 */
	getObjectById(id: number) {
		return this.worldZone.getObjectById(id) ?? super.getObjectById(id);
	}

	getZoneByName(value: string) {
		return (
			[this.worldZone as unknown as SimulationZone, ...this.zones].find(
				(zone: SimulationZone) => zone.name === value
			) ?? null
		);
	}

	getZoneByUuid(uuid: string) {
		return (
			[this.worldZone as unknown as SimulationZone, ...this.zones].find(
				(zone: SimulationZone) => zone.uuid === uuid
			) ?? null
		);
	}

	handleZoneEmpty(zone: BooleanZone): void {
		this.removeZone(zone);
	}

	getBooleanZoneOptions(): Record<string, string> {
		const zoneOptions = this.zones.filter(isBooleanZone).reduce((acc, zone: BooleanZone) => {
			acc[zone.uuid] = `${zone.name} [${zone.id}]`;
			return acc;
		}, {} as Record<string, string>);
		return zoneOptions;
	}
}

export const isZoneContainer = (x: unknown): x is ZoneContainer => x instanceof ZoneContainer;

export const isZoneManager = (x: unknown): x is ZoneManager => x instanceof ZoneManager;
