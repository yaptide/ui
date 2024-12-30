import * as Comlink from 'comlink';
import { Signal } from 'signals';
import * as THREE from 'three';

import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { ZoneWorker } from '../../CSG/CSGWorker';
import { JSON_VERSION, YaptideEditor } from '../../js/YaptideEditor';
import { SimulationSceneContainer } from '../Base/SimulationContainer';
import { SimulationElementJSON } from '../Base/SimulationElement';
import { SimulationElementManager } from '../Base/SimulationManager';
import { SimulationZone, SimulationZoneJSON } from '../Base/SimulationZone';
import { BooleanZone, BooleanZoneJSON, isBooleanZone } from './BooleanZone';
import { WorldZone, WorldZoneJSON } from './WorldZone/WorldZone';

type ZoneManagerJSON = Omit<
	SimulationElementJSON & {
		zones: SimulationZoneJSON[];
		worldZone: WorldZoneJSON;
		metadata: Record<string, string | number>;
	},
	never
>;

const zoneLoader = (editor: YaptideEditor) => (json: SimulationZoneJSON) => {
	if (json.type === 'BooleanZone') return BooleanZone.fromJSON(editor, json as BooleanZoneJSON);

	throw new Error(`Unknown zone type ${json.type}`);
};

export class ZoneContainer extends SimulationSceneContainer<SimulationZone> {
	readonly isZoneContainer: true = true;
	constructor(editor: YaptideEditor) {
		super(editor, 'Zones', 'ZoneGroup', zoneLoader(editor));
	}

	remove(...zones: SimulationZone[]): this {
		for (const zone of zones) zone.simulationMaterial.decrement();

		return super.remove(...zones);
	}

	// eslint-disable-next-line class-methods-use-this
	duplicate(): SimulationSceneContainer<SimulationZone> {
		throw new Error('Not implemented');
	}
}

export class ZoneManager
	extends THREE.Scene
	implements SimulationPropertiesType, SimulationElementManager<'zone', SimulationZone>
{
	/****************************Private****************************/
	private readonly metadata = {
		version: `0.12`,
		type: 'Manager',
		generator: 'ZoneManager.toJSON'
	} as {
		version: typeof JSON_VERSION;
	} satisfies Record<string, string | number>;

	private editor: YaptideEditor;
	private signals: {
		objectAdded: Signal<THREE.Object3D>;
		zoneAdded: Signal<SimulationZone>;
		zoneEmpty: Signal<BooleanZone>;
		objectRemoved: Signal<THREE.Object3D>;
		zoneRemoved: Signal<SimulationZone>;
		sceneGraphChanged: Signal;
	};

	private managerType: 'ZoneManager' = 'ZoneManager';

	private _name: string;
	/***************************************************************/

	/*******************SimulationPropertiesType********************/
	readonly notRemovable: boolean = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly flattenOnOutliner = true;
	readonly isSimulationElement = true;
	readonly isZoneManager: true = true;
	/***************************************************************/

	protected worker: Comlink.Remote<ZoneWorker>;

	/**
	 * @deprecated
	 */
	getObjectById(id: number) {
		return this.worldZone.getObjectById(id) ?? super.getObjectById(id);
	}

	/**************************ZoneMethods**************************/
	worldZone: WorldZone;
	zoneContainer: ZoneContainer;
	get zones() {
		return this.zoneContainer.children;
	}

	addZone(zone: SimulationZone): void {
		if (isBooleanZone(zone)) zone.worker = this.worker;
		this.zoneContainer.add(zone);
		this.editor.select(zone);

		this.signals.zoneAdded.dispatch(zone);
		this.signals.sceneGraphChanged.dispatch();
	}

	removeZone(zone: SimulationZone): void {
		this.zoneContainer.remove(zone);
		this.editor.deselect();

		this.signals.zoneRemoved.dispatch(zone);
		this.signals.sceneGraphChanged.dispatch();
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

	getZoneOptions(): Record<string, string> {
		const zoneOptions = [this.worldZone, ...this.zones].reduce(
			(acc, zone) => {
				acc[zone.uuid] = `${zone.name} [${zone.id}]`;

				return acc;
			},
			{} as Record<string, string>
		);

		return zoneOptions;
	}

	getZoneOptionsForScoring(): Record<string, string> {
		const zoneOptions = [...this.zones].reduce(
			(acc, zone) => {
				acc[zone.uuid] = `${zone.name} [${zone.id}]`;

				return acc;
			},
			{} as Record<string, string>
		);

		return zoneOptions;
	}

	getBooleanZoneOptions() {
		return this.getZoneOptions();
	}
	/***************************************************************/

	constructor(editor: YaptideEditor) {
		super();

		this.editor = editor;
		this.name = this._name = 'Zone Manager';

		this.zoneContainer = new ZoneContainer(editor);
		this.worldZone = new WorldZone(editor);
		this.worldZone.addHelpersToSceneHelpers();

		this.add(this.zoneContainer);
		this.add(this.worldZone);

		const light = new THREE.HemisphereLight(0xffffff, 0x222222, 1);
		light.position.set(15, 15, 15);
		this.add(light);

		this.worker = Comlink.wrap<ZoneWorker>(
			new Worker(new URL('../../CSG/CSGWorker.ts', import.meta.url))
		);

		this.signals = editor.signals;
		this.signals.zoneEmpty.add(this.handleZoneEmpty.bind(this));
	}

	protected handleZoneEmpty(zone: BooleanZone): void {
		this.removeZone(zone);
	}

	copy(source: this, recursive?: boolean | undefined) {
		super.copy(source, recursive);

		return this.fromJSON(source.toJSON());
	}

	reset() {
		this.name = this._name;
		this.zoneContainer.reset();
		this.worldZone.reset();

		return this;
	}

	toJSON(): ZoneManagerJSON {
		const { uuid, name, managerType: type, metadata } = this;

		return {
			uuid,
			name,
			type,
			metadata,
			zones: this.zoneContainer.toJSON(),
			worldZone: this.worldZone.toJSON()
		};
	}

	fromJSON(json: ZoneManagerJSON) {
		const {
			metadata: { version }
		} = this;
		const { uuid, name, zones, metadata } = json;

		if (!metadata || metadata.version !== version)
			console.warn(`ZoneManager version mismatch: ${metadata?.version} !== ${version}`);

		this.uuid = uuid;
		this.name = name;
		this.zoneContainer.fromJSON(zones);

		this.worldZone.removeHelpersFromSceneHelpers();
		this.remove(this.worldZone);
		this.worldZone.fromJSON(json.worldZone);
		this.add(this.worldZone);
		this.worldZone.addHelpersToSceneHelpers();

		return this;
	}
}

export const isZoneContainer = (x: unknown): x is ZoneContainer => x instanceof ZoneContainer;

export const isZoneManager = (x: unknown): x is ZoneManager => x instanceof ZoneManager;
