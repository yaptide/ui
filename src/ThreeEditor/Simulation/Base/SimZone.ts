import * as THREE from 'three';
import { SimulationMesh } from './SimulationMesh';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { SimulationSceneChild, SimulationSceneContainer } from './SimulationContainer';
import { YaptideEditor } from '../../js/YaptideEditor';
import SimulationMaterial, { SimulationMaterialJSON } from '../Materials/SimulationMaterial';

export interface SimulationZoneJSON {
	uuid: string;
	name: string;
	materialUuid: string;
	materialPropertiesOverrides: Partial<MaterialOverridable>;
	customMaterial?: SimulationMaterialJSON;
}

interface MaterialOverridable {
	density: number;
}

type PropertyOverride<T = unknown> = {
	override: boolean;
	value: T;
};

type OverrideMap = {
	[Key in keyof MaterialOverridable]: PropertyOverride<MaterialOverridable[Key]>;
};

const _get_default = (material: SimulationMaterial) => {
	return {
		materialPropertiesOverrides: {
			density: {
				override: false,
				value: material.density
			}
		}
	};
};

export abstract class SimulationZone
	extends SimulationMesh<THREE.BufferGeometry, SimulationMaterial>
	implements SimulationPropertiesType, SimulationSceneChild
{
	editor: YaptideEditor;
	parent: SimulationSceneContainer<this> | null = null;
	readonly isZone: true = true;
	private _materialPropertiesOverrides: OverrideMap;
	private usingCustomMaterial = false;

	private isSomePropertyOverridden(): boolean {
		return Object.values<PropertyOverride>(this._materialPropertiesOverrides).some(
			({ override }) => override
		);
	}

	get materialPropertiesOverrides() {
		return this._materialPropertiesOverrides;
	}

	set materialPropertiesOverrides(overrides: OverrideMap) {
		this._materialPropertiesOverrides = {
			...overrides
		};

		const isCurrentlyUsingCustomMaterial: boolean = this.isSomePropertyOverridden();

		if (isCurrentlyUsingCustomMaterial !== this.usingCustomMaterial) {
			this.usingCustomMaterial = isCurrentlyUsingCustomMaterial;

			if (this.usingCustomMaterial) this.material.decrement();
			else this.material.increment();
		}
	}

	private resetCustomMaterial(): void {
		this._materialPropertiesOverrides = {
			..._get_default(this.material).materialPropertiesOverrides
		};
		this.usingCustomMaterial = false;
	}

	get simulationMaterial(): SimulationMaterial {
		return this.material;
	}

	set simulationMaterial(value: SimulationMaterial) {
		this.material.decrement();
		this.material = value;
		this.resetCustomMaterial();
		this.material.increment();
	}

	constructor(editor: YaptideEditor, name: string, type: string = 'Zone') {
		super(
			editor,
			name,
			type,
			new THREE.BufferGeometry(),
			editor.materialManager.defaultMaterial
		);
		this.editor = editor;
		this.material.increment();
		this._materialPropertiesOverrides = {
			..._get_default(this.material).materialPropertiesOverrides
		};
	}

	toJSON(): SimulationZoneJSON {
		const customMaterial = this.usingCustomMaterial
			? this.simulationMaterial.clone().toJSON()
			: undefined;
		const { uuid: materialUuid } = this.usingCustomMaterial
			? customMaterial!
			: this.simulationMaterial;
		const { uuid, name, materialPropertiesOverrides: overrides } = this;
		const materialPropertiesOverrides = Object.entries(overrides).reduce<
			Partial<MaterialOverridable>
		>((acc, [key, { override, value }]) => {
			return {
				...acc,
				[key]: override ? value : undefined
			};
		}, {});

		return {
			uuid,
			name,
			materialUuid,
			materialPropertiesOverrides,
			customMaterial
		};
	}

	copy(source: this, recursive: boolean): this {
		super.copy(source, recursive);
		this.simulationMaterial = source.material;
		this._materialPropertiesOverrides = { ...source.materialPropertiesOverrides };
		return this;
	}

	fromJSON(json: SimulationZoneJSON): this {
		const { uuid, name, materialUuid, materialPropertiesOverrides: overrides } = json;
		this.uuid = uuid;
		this.name = name;
		this.simulationMaterial =
			this.editor.materialManager.getMaterialByUuid(materialUuid) ??
			this.editor.materialManager.defaultMaterial;
		this.materialPropertiesOverrides = {
			...Object.entries(overrides).reduce<OverrideMap>(
				(acc, [key, value]) => {
					return {
						...acc,
						[key]: {
							override: true,
							value
						}
					};
				},
				{
					..._get_default(this.material).materialPropertiesOverrides
				}
			)
		};

		return this;
	}
}
