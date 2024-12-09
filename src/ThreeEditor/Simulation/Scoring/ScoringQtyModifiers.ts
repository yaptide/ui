import * as THREE from 'three';

import { DETECTOR_MODIFIERS, DETECTOR_MODIFIERS_OPTIONS } from './ScoringOutputTypes';

export type DifferentialJSON = {
	lowerLimit: number;
	upperLimit: number;
	binsNumber: number;
	isLog: boolean;
	uuid: string;
	volume: number;
	diffType: DETECTOR_MODIFIERS;
	trackId: string;
};

export class DifferentialModifier {
	lowerLimit: number;
	upperLimit: number;
	binsNumber: number;
	isLog: boolean;
	diffType: DETECTOR_MODIFIERS;
	trackId: string;
	volume: number;
	type: 'differential' = 'differential';
	uuid: string;
	constructor(
		lowerLimit: number = 0,
		binsNumber: number = 500,
		upperLimit: number = 10,
		isLog: boolean = false,
		diffType: DETECTOR_MODIFIERS = DETECTOR_MODIFIERS_OPTIONS.E,
		volume: number = 1,
		trackId: string = ''
	) {
		this.uuid = THREE.MathUtils.generateUUID();
		this.lowerLimit = lowerLimit;
		this.upperLimit = upperLimit;
		this.binsNumber = binsNumber;
		this.isLog = isLog;
		this.diffType = diffType;
		this.trackId = trackId;
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
			trackId: this.trackId,
			volume: this.volume
		};
	}

	static fromJSON(json: DifferentialJSON): DifferentialModifier {
		let mod = new DifferentialModifier(
			json.lowerLimit,
			json.binsNumber,
			json.upperLimit,
			json.isLog,
			json.diffType,
			json.volume,
			json.trackId
		);

		mod.uuid = json.uuid;

		return mod;
	}

	duplicate(): DifferentialModifier {
		return new DifferentialModifier(
			this.lowerLimit,
			this.binsNumber,
			this.upperLimit,
			this.isLog,
			this.diffType,
			this.volume,
			this.trackId
		);
	}
}
