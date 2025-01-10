import * as THREE from 'three';

import { DETECTOR_MODIFIERS } from './ScoringOutputTypes';

export type DifferentialJSON = {
	lowerLimit: number;
	upperLimit: number;
	binsNumber: number;
	isLog: boolean;
	uuid: string;
	volume: number;
	diffType: DETECTOR_MODIFIERS;
};

export class DifferentialModifier {
	lowerLimit: number;
	upperLimit: number;
	binsNumber: number;
	isLog: boolean;
	diffType: DETECTOR_MODIFIERS;
	volume: number;
	type: 'differential' = 'differential';
	uuid: string;
	constructor(
		diffType: DETECTOR_MODIFIERS = DETECTOR_MODIFIERS.ANGLE,
		lowerLimit: number = 0,
		binsNumber: number = 500,
		upperLimit: number = 10,
		isLog: boolean = false,
		volume: number = 1
	) {
		this.uuid = THREE.MathUtils.generateUUID();
		this.lowerLimit = lowerLimit;
		this.upperLimit = upperLimit;
		this.binsNumber = binsNumber;
		this.isLog = isLog;
		this.diffType = diffType;
		this.volume = volume;
	}

	toJSON(): DifferentialJSON {
		return {
			lowerLimit: this.lowerLimit,
			upperLimit: this.upperLimit,
			binsNumber: this.binsNumber,
			isLog: this.isLog,
			uuid: this.uuid,
			diffType: this.diffType,
			volume: this.volume
		};
	}

	static fromJSON(json: DifferentialJSON): DifferentialModifier {
		let mod = new DifferentialModifier(
			json.diffType,
			json.lowerLimit,
			json.binsNumber,
			json.upperLimit,
			json.isLog,
			json.volume
		);

		mod.uuid = json.uuid;

		return mod;
	}

	duplicate(): DifferentialModifier {
		return new DifferentialModifier(
			this.diffType,
			this.lowerLimit,
			this.binsNumber,
			this.upperLimit,
			this.isLog,
			this.volume
		);
	}
}
