export interface ISimulationObject {
	readonly isObject3D: true;
	readonly notRemovable?: boolean;
	readonly notMovable?: boolean;
	readonly notRotatable?: boolean;
	readonly notScalable?: boolean;
}
