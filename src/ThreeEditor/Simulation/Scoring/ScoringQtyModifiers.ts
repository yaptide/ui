import { DETECTOR_MODIFIERS } from './ScoringOutputTypes';
import * as THREE from 'three';

export type DifferentialJSON = {
	diffType: DETECTOR_MODIFIERS;
	lowerLimit: number;
	upperLimit: number;
	binsNumber: number;
	isLog: boolean;
	uuid: string;
};

export class DifferentialModifier {
	lowerLimit: number;
	upperLimit: number;
	binsNumber: number;
	isLog: boolean;
	diffType: DETECTOR_MODIFIERS;
	type: 'differential' = 'differential';
	uuid: string;
	constructor(
		diffType: DETECTOR_MODIFIERS = 'ANGLE',
		lowerLimit: number = 0,
		binsNumber: number = 500,
		upperLimit: number = 10,
		isLog: boolean = false
	) {
		this.uuid = THREE.MathUtils.generateUUID();
		this.diffType = diffType;
		this.lowerLimit = lowerLimit;
		this.upperLimit = upperLimit;
		this.binsNumber = binsNumber;
		this.isLog = isLog;
	}

	toJSON(): DifferentialJSON {
		return {
			diffType: this.diffType,
			lowerLimit: this.lowerLimit,
			upperLimit: this.upperLimit,
			binsNumber: this.binsNumber,
			isLog: this.isLog,
			uuid: this.uuid
		};
	}

	static fromJSON(json: DifferentialJSON): DifferentialModifier {
		const mod = new DifferentialModifier(
			json.diffType,
			json.lowerLimit,
			json.binsNumber,
			json.upperLimit,
			json.isLog
		);
		mod.uuid = json.uuid;
		return mod;
	}
}
