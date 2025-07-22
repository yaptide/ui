import { Signal } from 'signals';
import * as THREE from 'three';

import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { CounterMap } from '../../../util/CounterMap/CounterMap';
import { SerializableState } from '../../js/EditorJson';
import { JSON_VERSION, YaptideEditor } from '../../js/YaptideEditor.js';
import { SimulationElementJSON } from '../Base/SimulationElement';
import { DEFAULT_MATERIAL_ICRU, MATERIALS, WORLD_ZONE_DEFAULT_MATERIAL_ICRU } from './materials';
import SimulationMaterial, {
	isSimulationMaterial,
	SimulationMaterialJSON
} from './SimulationMaterial';

export type MaterialManagerJSON = Omit<
	SimulationElementJSON & {
		materials: SimulationMaterialJSON[];
		selectedMaterials: Record<string, number>;
		metadata: Record<string, string | number>;
	},
	never
>;

export type Icru = number;

export class MaterialManager
	extends THREE.Object3D
	implements SimulationPropertiesType, SerializableState<MaterialManagerJSON>
{
	/****************************Private****************************/
	private readonly metadata = {
		version: `0.12`,
		type: 'Manager',
		generator: 'MaterialManager.toSerialized'
	} as {
		version: typeof JSON_VERSION;
	} satisfies Record<string, string | number>;

	private editor: YaptideEditor;
	private signals: {
		materialChanged: Signal<SimulationMaterial>;
	};

	private managerType: 'MaterialManager' = 'MaterialManager';

	private _name: string;
	private _customMaterials: Record<string, SimulationMaterial> = {};

	private createMaterialPrefabs = () => {
		const { editor } = this;
		const editorMaterials = MATERIALS.reduce(
			(
				[prevMaterials, prevOptions],
				{ name, sanitized_name: sanitizedName, icru, density }
			) => [
				{
					...prevMaterials,
					[icru]: new SimulationMaterial(editor, name, sanitizedName, icru, density)
				},
				{
					...prevOptions,
					[icru]: name
				}
			],
			[{}, {}]
		);

		return editorMaterials;
	};

	private prefabMaterials: Record<string, SimulationMaterial>;
	/***************************************************************/

	/*******************SimulationPropertiesType********************/
	readonly notRemovable: boolean = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly flattenOnOutliner = true;
	readonly isSimulationElement = true;
	readonly isMaterialsManager: true = true;
	/***************************************************************/

	/************************MaterialMethods************************/
	materialOptions: Record<string, string>;
	get defaultMaterial(): SimulationMaterial {
		let defaultMaterial = this._customMaterials[DEFAULT_MATERIAL_ICRU];

		if (defaultMaterial) return defaultMaterial;
		defaultMaterial = this.prefabMaterials[DEFAULT_MATERIAL_ICRU];
		this._customMaterials[DEFAULT_MATERIAL_ICRU] = defaultMaterial;

		return defaultMaterial;
	}

	get worldZoneDefaultMaterial(): SimulationMaterial {
		let defaultMaterial = this._customMaterials[WORLD_ZONE_DEFAULT_MATERIAL_ICRU];

		if (defaultMaterial) return defaultMaterial;
		defaultMaterial = this.prefabMaterials[WORLD_ZONE_DEFAULT_MATERIAL_ICRU];
		this._customMaterials[WORLD_ZONE_DEFAULT_MATERIAL_ICRU] = defaultMaterial;

		return defaultMaterial;
	}

	selectedMaterials: CounterMap<string> = new CounterMap<string>();

	getMaterialByUuid(uuid: string): SimulationMaterial | undefined {
		return Object.values(this._customMaterials).find(material => material.uuid === uuid);
	}
	/***************************************************************/

	/*************************ProxyHandling*************************/
	protected materialsHandler = {
		get: (target: Record<string, SimulationMaterial>, prop: string) => {
			let result = target[prop];

			if (result) return result;
			result = this.prefabMaterials[prop];

			if (result) target[prop] = result;
			else {
				result = this.defaultMaterial;
				target[DEFAULT_MATERIAL_ICRU] = result;
			}

			return result;
		},
		set: (target: Record<string, SimulationMaterial>, prop: string, value: unknown) => {
			Reflect.set(this.materialOptions, prop, prop);

			return Reflect.set(target, prop, value);
		},
		ownKeys: (target: Record<string, SimulationMaterial>) => {
			return Array.from(
				new Set([...Reflect.ownKeys(target), ...Reflect.ownKeys(this.prefabMaterials)])
			);
		},
		has: (target: Record<string, SimulationMaterial>, key: string) => {
			return key in this.prefabMaterials || key in target;
		},
		getOwnPropertyDescriptor(target: Record<string, SimulationMaterial>, key: string) {
			return {
				value: this.get(target, key),
				enumerable: true,
				configurable: true
			};
		}
	};

	protected materialsProxy: Record<string, SimulationMaterial>;
	get materials(): Record<string, SimulationMaterial> {
		return this.materialsProxy;
	}
	/***************************************************************/

	constructor(editor: YaptideEditor) {
		super();

		this.editor = editor;
		this.name = this._name = 'Material Manager';

		[this.prefabMaterials, this.materialOptions] = this.createMaterialPrefabs();

		// Initialize _customMaterials with essential materials that should always be available
		this._customMaterials[WORLD_ZONE_DEFAULT_MATERIAL_ICRU] =
			this.prefabMaterials[WORLD_ZONE_DEFAULT_MATERIAL_ICRU];
		this._customMaterials[DEFAULT_MATERIAL_ICRU] = this.prefabMaterials[DEFAULT_MATERIAL_ICRU];

		this.materialsProxy = new Proxy(this._customMaterials, this.materialsHandler);

		this.signals = editor.signals;
		this.signals.materialChanged.add(this.onMaterialChanged.bind(this));
	}

	private onMaterialChanged(material: THREE.Material) {
		if (isSimulationMaterial(material)) this._customMaterials[material.icru] = material;
	}

	copy(source: this, recursive?: boolean | undefined) {
		super.copy(source, recursive);

		return this.fromSerialized(source.toSerialized());
	}

	reset(): void {
		this.selectedMaterials.clear();
		this._customMaterials = {};

		// Ensure default material and world zone material are added to _customMaterials
		// This ensures that when a new empty project is created, these materials are available
		this._customMaterials[WORLD_ZONE_DEFAULT_MATERIAL_ICRU] =
			this.prefabMaterials[WORLD_ZONE_DEFAULT_MATERIAL_ICRU];
		this._customMaterials[DEFAULT_MATERIAL_ICRU] = this.prefabMaterials[DEFAULT_MATERIAL_ICRU];
	}

	toSerialized(): MaterialManagerJSON {
		const { uuid, name, managerType: type, metadata } = this;
		const selectedMaterials = this.selectedMaterials.toSerialized();

		const worldZoneMaterial = this._customMaterials[WORLD_ZONE_DEFAULT_MATERIAL_ICRU];
		const worldZoneMaterialUuid = worldZoneMaterial?.uuid;

		const materials = Object.entries(this._customMaterials)
			.map(([_icru, material]) => {
				const serialized = material.toSerialized();

				return serialized;
			})
			.filter(({ uuid: matUuid }) => {
				const isWorldZoneMaterial = worldZoneMaterialUuid === matUuid;
				const isSelected = this.selectedMaterials.has(matUuid);

				return isSelected || isWorldZoneMaterial;
			});

		return {
			uuid,
			name,
			type,
			materials,
			selectedMaterials,
			metadata
		};
	}

	fromSerialized(json: MaterialManagerJSON) {
		const {
			editor,
			metadata: { version }
		} = this;
		const { uuid, name, materials, metadata } = json;

		if (!metadata || metadata.version !== version)
			console.warn(`MaterialManager version mismatch: ${metadata?.version} !== ${version}`);

		this.uuid = uuid;
		this.name = name;

		// Clear existing materials and assign the deserialized ones
		this._customMaterials = {};

		Object.assign(
			this._customMaterials,
			materials.reduce(
				(prev, json) => ({
					...prev,
					[json.icru]: SimulationMaterial.fromSerialized(editor, json)
				}),
				{}
			)
		);

		// Ensure that default and world zone materials are available regardless
		// of whether they were included in the serialized data
		const hasWorldZoneMaterial = WORLD_ZONE_DEFAULT_MATERIAL_ICRU in this._customMaterials;
		const hasDefaultMaterial = DEFAULT_MATERIAL_ICRU in this._customMaterials;

		if (!hasWorldZoneMaterial) {
			this._customMaterials[WORLD_ZONE_DEFAULT_MATERIAL_ICRU] =
				this.prefabMaterials[WORLD_ZONE_DEFAULT_MATERIAL_ICRU];
		}

		if (!hasDefaultMaterial) {
			this._customMaterials[DEFAULT_MATERIAL_ICRU] =
				this.prefabMaterials[DEFAULT_MATERIAL_ICRU];
		}

		return this;
	}
}

export const isMaterialManager = (x: unknown): x is MaterialManager => x instanceof MaterialManager;
