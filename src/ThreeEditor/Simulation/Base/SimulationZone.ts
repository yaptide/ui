import * as THREE from 'three';

import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { SerializableState } from '../../js/EditorJson';
import { YaptideEditor } from '../../js/YaptideEditor';
import SimulationMaterial, { SimulationMaterialJSON } from '../Materials/SimulationMaterial';
import { SimulationSceneChild, SimulationSceneContainer } from './SimulationContainer';
import { SimulationElement, SimulationElementJSON } from './SimulationElement';

export type SimulationZoneMaterialJSON = {
	materialUuid?: string;
	materialPropertiesOverrides?: Partial<MaterialOverridable>;
	customMaterial?: SimulationMaterialJSON & {
		originalMaterialUuid: string;
	};
	visible: boolean;
};

export type SimulationZoneJSON = Omit<SimulationElementJSON & SimulationZoneMaterialJSON, never>;

export interface MaterialOverridable {
	density: number;
	customStoppingPower: boolean;
}

export type PropertyOverride<T = unknown> = {
	override: boolean;
	value: T;
};

export type OverrideMap = {
	[Key in keyof MaterialOverridable]: PropertyOverride<MaterialOverridable[Key]>;
};

export const getDefaultMaterialPropertiesOverrides = (material: SimulationMaterial) => {
	return {
		materialPropertiesOverrides: {
			density: {
				override: false,
				value: material.density
			},
			customStoppingPower: {
				override: false,
				value: material.customStoppingPower
			}
		}
	};
};

/**
 * This is the base class for all zone objects
 * Zones are objects that have specified simulation material.
 *
 * Geometry is not specified, because their definition can vary depending on the type of zone
 * @see {@link BooleanZone}
 * @see {@link TreeZone}
 */
export abstract class SimulationZone
	extends THREE.Mesh<THREE.BufferGeometry, SimulationMaterial>
	implements
		SimulationElement,
		SimulationPropertiesType,
		SimulationSceneChild,
		SerializableState<SimulationZoneJSON>
{
	editor: YaptideEditor;
	parent: SimulationSceneContainer<this> | null = null;
	_name: string;
	readonly isZone: true = true;
	readonly type: string;
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
		this.materialPropertiesOverrides = {
			...getDefaultMaterialPropertiesOverrides(this.material).materialPropertiesOverrides
		};
	}

	private reconstructMaterialFromJSON(json: SimulationZoneJSON) {
		const { materialUuid, customMaterial } = json;
		const simulationMaterial = materialUuid
			? this.editor.materialManager.getMaterialByUuid(
					customMaterial && materialUuid === customMaterial.uuid
						? customMaterial.originalMaterialUuid
						: materialUuid
				)
			: this.editor.materialManager.defaultMaterial;

		if (simulationMaterial === undefined) throw new Error('SimulationMaterial not found');
		this.simulationMaterial = simulationMaterial;
	}

	get simulationMaterial(): SimulationMaterial {
		return this.material;
	}

	set simulationMaterial(value: SimulationMaterial) {
		this.resetCustomMaterial();
		this.material.decrement();
		this.material = value;
		this.material.increment();
	}

	readonly isSimulationElement = true;

	constructor(editor: YaptideEditor, name: string, type: string = 'Zone') {
		super(new THREE.BufferGeometry(), editor.materialManager.defaultMaterial);
		this.editor = editor;
		this.name = this._name = name ?? type;
		this.type = type;
		this.material.increment();
		this._materialPropertiesOverrides = {
			...getDefaultMaterialPropertiesOverrides(this.material).materialPropertiesOverrides
		};
	}

	reset() {
		this.name = this._name;
		this.resetCustomMaterial();
		this.simulationMaterial = this.editor.materialManager.defaultMaterial;
	}

	toSerialized(): SimulationZoneJSON {
		const { uuid, name, type, visible, materialPropertiesOverrides: overrides } = this;
		const customMaterial = this.usingCustomMaterial
			? {
					...this.simulationMaterial.clone().toSerialized(),
					originalMaterialUuid: this.simulationMaterial.uuid
				}
			: undefined;

		const { uuid: materialUuid } = this.usingCustomMaterial
			? customMaterial!
			: this.simulationMaterial;

		const materialPropertiesOverrides = Object.entries(overrides).reduce<
			Partial<MaterialOverridable>
		>((acc, [key, { override, value }]) => {
			return {
				...acc,
				...(override && { [key]: value })
			};
		}, {});

		return {
			uuid,
			name,
			type,
			visible,
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

	fromSerialized(json: SimulationZoneJSON) {
		this.reset();
		const { uuid, name, visible, materialPropertiesOverrides: overrides } = json;

		this.uuid = uuid;
		this.name = name;
		this.visible = visible;
		this.reconstructMaterialFromJSON(json);
		this.materialPropertiesOverrides = {
			...Object.entries(overrides ?? {}).reduce<OverrideMap>(
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
					...getDefaultMaterialPropertiesOverrides(this.material)
						.materialPropertiesOverrides
				}
			)
		};

		return this;
	}

	// eslint-disable-next-line class-methods-use-this
	duplicate(): SimulationZone {
		throw new Error('Method not implemented.');
	}
}

export function isSimulationZone(object: unknown): object is SimulationZone {
	return object instanceof SimulationZone;
}
