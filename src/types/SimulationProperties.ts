/**
 * Type for properties of a simulation object.
 * isObject3D is always true and is defined in the type because you can't implement a type in a class without defining at least one property.
 * all other properties are optional and are used to properly handle the object in the editor.
 */
export type SimulationPropertiesType = {
	readonly isSimulationElement?: true;
	readonly notRemovable?: boolean;
	readonly notMovable?: boolean;
	readonly notRotatable?: boolean;
	readonly notScalable?: boolean;
	readonly notHidable?: boolean;
	readonly notCloneable?: boolean;
	readonly notVisibleChildren?: boolean;
	readonly flattenOnOutliner?: boolean;
};
