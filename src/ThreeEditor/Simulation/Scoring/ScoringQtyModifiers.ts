import * as THREE from 'three';

import { DETECTOR_MODIFIERS, DETECTOR_MODIFIERS_OPTIONS } from './ScoringOutputTypes';

export type DifferentialJSON = DifferentialJSONCommon | DifferentialJSONSH | DifferentialJSONFluka;

export type DifferentialJSONCommon = {
	lowerLimit: number;
	upperLimit: number;
	binsNumber: number;
	isLog: boolean;
	uuid: string;
	diffType?: DETECTOR_MODIFIERS;
	volume?: number;
};

const isDifferentialJSONSH = (x: any): x is DifferentialJSONSH => {
	return x.diffType !== undefined;
};

export type DifferentialJSONSH = DifferentialJSONCommon & {
	diffType: DETECTOR_MODIFIERS;
};

const isDifferentialJSONFluka = (x: any): x is DifferentialJSONFluka => {
	return x.volume !== undefined;
};

export type DifferentialJSONFluka = Omit<DifferentialJSONCommon, 'diffType'> & {
	volume: number;
};

export class DifferentialModifier {
	lowerLimit: number;
	upperLimit: number;
	binsNumber: number;
	isLog: boolean;
	type: 'differential' = 'differential';
	uuid: string;
	constructor(
		lowerLimit: number = 0,
		binsNumber: number = 500,
		upperLimit: number = 10,
		isLog: boolean = false
	) {
		this.uuid = THREE.MathUtils.generateUUID();
		this.lowerLimit = lowerLimit;
		this.upperLimit = upperLimit;
		this.binsNumber = binsNumber;
		this.isLog = isLog;
	}

	toJSON(): DifferentialJSONCommon {
		return {
			lowerLimit: this.lowerLimit,
			upperLimit: this.upperLimit,
			binsNumber: this.binsNumber,
			isLog: this.isLog,
			uuid: this.uuid
		};
	}

	static fromJSON(json: DifferentialJSON): DifferentialModifier {
		let mod;

		if (isDifferentialJSONFluka(json)) {
			mod = new DifferentialModifierFluka(
				json.lowerLimit,
				json.binsNumber,
				json.upperLimit,
				json.isLog,
				json.volume
			);
		} else if (isDifferentialJSONSH(json)) {
			mod = new DifferentialModifierSH(
				json.lowerLimit,
				json.binsNumber,
				json.upperLimit,
				json.isLog,
				json.diffType
			);
		} else {
			mod = new DifferentialModifier(
				json.lowerLimit,
				json.binsNumber,
				json.upperLimit,
				json.isLog
			);
		}

		if (mod) {
			mod.uuid = json.uuid;

			return mod;
		} else {
			throw new Error('Invalid differential json');
		}
	}

	duplicate(): DifferentialModifier {
		return new DifferentialModifier(
			this.lowerLimit,
			this.binsNumber,
			this.upperLimit,
			this.isLog
		);
	}
}

export class DifferentialModifierFluka extends DifferentialModifier {
	volume: number;
	//diffType left for compability with react components
	diffType: DETECTOR_MODIFIERS = DETECTOR_MODIFIERS_OPTIONS.E;
	constructor(
		lowerLimit: number = 0,
		binsNumber: number = 500,
		upperLimit: number = 10,
		isLog: boolean = false,
		volume: number = 1
	) {
		super(lowerLimit, binsNumber, upperLimit, isLog);
		this.volume = volume;
	}

	toJSON(): DifferentialJSONFluka {
		return {
			lowerLimit: this.lowerLimit,
			upperLimit: this.upperLimit,
			binsNumber: this.binsNumber,
			isLog: this.isLog,
			uuid: this.uuid,
			volume: this.volume
		};
	}

	duplicate(): DifferentialModifierFluka {
		const duplicated = new DifferentialModifierFluka(
			this.lowerLimit,
			this.binsNumber,
			this.upperLimit,
			this.isLog,
			this.volume
		);

		return duplicated;
	}
}

export class DifferentialModifierSH extends DifferentialModifier {
	diffType: DETECTOR_MODIFIERS;
	constructor(
		lowerLimit: number = 0,
		binsNumber: number = 500,
		upperLimit: number = 10,
		isLog: boolean = false,
		diffType: DETECTOR_MODIFIERS = 'ANGLE'
	) {
		super(lowerLimit, binsNumber, upperLimit, isLog);
		this.uuid = THREE.MathUtils.generateUUID();
		this.lowerLimit = lowerLimit;
		this.upperLimit = upperLimit;
		this.binsNumber = binsNumber;
		this.isLog = isLog;
		this.diffType = diffType;
	}

	toJSON(): DifferentialJSONSH {
		return {
			diffType: this.diffType,
			lowerLimit: this.lowerLimit,
			upperLimit: this.upperLimit,
			binsNumber: this.binsNumber,
			isLog: this.isLog,
			uuid: this.uuid
		};
	}

	duplicate(): DifferentialModifierSH {
		const duplicated = new DifferentialModifierSH(
			this.lowerLimit,
			this.binsNumber,
			this.upperLimit,
			this.isLog,
			this.diffType
		);

		return duplicated;
	}
}
