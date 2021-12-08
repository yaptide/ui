import { SimulationObject3D } from '../SimulationBase/SimulationMesh';

export interface ScoringQtyModifier {
	type: string;
	lowerBound: number;
	upperBound: number;
	numberOfBins: number;
	isLog: boolean;
}

export class RescaleModifier implements ScoringQtyModifier {
	type: 'Rescale' = 'Rescale';
	lowerBound: number;
	upperBound: number;
	numberOfBins: number;
	isLog: boolean;
	constructor(lowerBound: number, numberOfBins: number, upperBound: number, isLog: boolean) {
		this.lowerBound = lowerBound;
		this.upperBound = upperBound;
		this.numberOfBins = numberOfBins;
		this.isLog = isLog;
	}
}
