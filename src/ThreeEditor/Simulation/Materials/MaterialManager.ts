import { DEFAULT_MATERIAL_ICRU, MATERIALS } from './materials';
import SimulationMaterial, {
	isSimulationMaterial,
	SimulationMaterialJSON
} from './SimulationMaterial';
import * as THREE from 'three';
import { YaptideEditor } from '../../js/YaptideEditor.js';
import { CounterMap } from '../../../util/CounterMap/CounterMap';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { Signal } from 'signals';
import { SimulationElementJSON } from '../Base/SimulationElement';

export type MaterialManagerJSON = Omit<
	SimulationElementJSON & {
		materials: SimulationMaterialJSON[];
		selectedMaterials: Record<string, number>;
		metadata: Record<string, string | number>;
	},
	never
>;

export class MaterialManager extends THREE.Object3D implements SimulationPropertiesType {
	/****************************Private****************************/
	private readonly metadata = {
		version: 1.0, //update this to current YaptideEditor version when format changes
		type: 'Manager',
		generator: 'MaterialManager.toJSON'
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
			([prevMaterials, prevOptions], { name, icru, density }) => [
				{
					...prevMaterials,
					[icru]: new SimulationMaterial(editor, name, icru, density)
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
		this.materialsProxy = new Proxy(this._customMaterials, this.materialsHandler);

		this.signals = editor.signals;
		this.signals.materialChanged.add(this.onMaterialChanged.bind(this));
	}

	private onMaterialChanged(material: THREE.Material) {
		if (isSimulationMaterial(material)) this._customMaterials[material.icru] = material;
	}

	copy(source: this, recursive?: boolean | undefined) {
		super.copy(source, recursive);
		return this.fromJSON(source.toJSON());
	}

	reset(): void {
		this.selectedMaterials.clear();
		this._customMaterials = {};
	}

	toJSON(): MaterialManagerJSON {
		const { uuid, name, managerType: type, metadata } = this;
		const selectedMaterials = this.selectedMaterials.toJSON();
		const materials = Object.entries(this._customMaterials)
			.map(([_icru, material]) => material.toJSON())
			.filter(
				({ uuid, name, icru, density, ...rest }) =>
					this.selectedMaterials.has(uuid) || Object.keys(rest).length !== 0
			);
		return {
			uuid,
			name,
			type,
			materials,
			selectedMaterials,
			metadata
		};
	}

	fromJSON(json: MaterialManagerJSON) {
		const {
			editor,
			metadata: { version }
		} = this;
		const { uuid, name, materials, metadata } = json;
		if (!metadata || metadata.version !== version)
			console.warn(`MaterialManager version mismatch: ${metadata?.version} !== ${version}`);

		this.uuid = uuid;
		this.name = name;
		Object.assign(
			this._customMaterials,
			materials.reduce(
				(prev, json) => ({
					...prev,
					[json.icru]: SimulationMaterial.fromJSON(editor, json)
				}),
				{}
			)
		);
		return this;
	}
}

export const isMaterialManager = (x: unknown): x is MaterialManager => x instanceof MaterialManager;
