import { SimulationObject3D } from '../SimulationBase/SimulationMesh';

export class DetectOutput extends SimulationObject3D {
	readonly isOutput: true = true;
	readonly notRemovable = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	toJSON(): unknown {
		throw new Error('Method not implemented.');
	}
}

export const isDetectOutput = (x: any): x is DetectOutput => x instanceof DetectOutput;
