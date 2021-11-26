import { SimulationData } from '../SimulationBase/SimulationMesh';

export class DetectOutput extends SimulationData {
	toJSON(): unknown {
		throw new Error('Method not implemented.');
	}
}

export const isDetectOutput = (x: any): x is DetectOutput => x instanceof DetectOutput;
