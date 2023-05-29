import { DEFAULT_MATERIAL_ICRU, MATERIALS } from './materials';
import SimulationMaterial, {
	isSimulationMaterial,
	SimulationMaterialJSON
} from './SimulationMaterial';
import * as THREE from 'three';
import { YaptideEditor } from '../../js/Editor.js';
import { CounterMap } from '../../../util/CounterMap/CounterMap';

export type MaterialManagerJSON = {
	materials: SimulationMaterialJSON[];
	selectedMaterials: Record<string, number>;
};

export class MaterialManager {
	private editor: YaptideEditor;
	private prefabMaterials: Record<string, SimulationMaterial>;
	private customMaterials: Record<string, SimulationMaterial>;
	materialOptions: Record<string, string>;
	materials: Record<string, SimulationMaterial>;
	selectedMaterials: CounterMap<string>;

	constructor(editor: YaptideEditor) {
		this.editor = editor;
		[this.prefabMaterials, this.materialOptions] = this.createMaterialPrefabs();
		this.customMaterials = {};
		this.selectedMaterials = new CounterMap<string>();

		const materialsHandler = {
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

		this.materials = new Proxy(this.customMaterials, materialsHandler);
		this.editor.signals.materialChanged.add(this.onMaterialChanged.bind(this));
	}

	private onMaterialChanged(material: THREE.Material) {
		if (isSimulationMaterial(material)) this.customMaterials[material.icru] = material;
	}

	get defaultMaterial(): SimulationMaterial {
		let defaultMaterial = this.customMaterials[DEFAULT_MATERIAL_ICRU];
		if (defaultMaterial) return defaultMaterial;
		defaultMaterial = this.prefabMaterials[DEFAULT_MATERIAL_ICRU];
		this.customMaterials[DEFAULT_MATERIAL_ICRU] = defaultMaterial;
		return defaultMaterial;
	}

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

	toJSON(): MaterialManagerJSON {
		const selectedMaterials = this.selectedMaterials.toJSON();
		const materials = Object.entries(this.customMaterials)
			.map(([_icru, material]) => material.toJSON())
			.filter(
				({ uuid, name, icru, density, ...rest }) =>
					this.selectedMaterials.has(uuid) || Object.keys(rest).length !== 0
			);
		return { materials, selectedMaterials };
	}

	fromJSON({ materials }: MaterialManagerJSON): void {
		const { editor } = this;
		Object.assign(
			this.customMaterials,
			materials.reduce(
				(prev, json) => ({
					...prev,
					[json.icru]: SimulationMaterial.fromJSON(editor, json)
				}),
				{}
			)
		);
	}

	getMaterialByUuid(uuid: string): SimulationMaterial | undefined {
		return Object.values(this.customMaterials).find(material => material.uuid === uuid);
	}

	reset(): void {
		this.selectedMaterials.clear();
		this.customMaterials = {};
	}
}
