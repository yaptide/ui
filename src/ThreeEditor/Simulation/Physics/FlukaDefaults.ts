import { StoppingPowerFile } from '../CustomStoppingPower/CustomStoppingPower';
import { Icru } from '../Materials/MaterialManager';

export const FLUKA_DEFAULTS = {
	'1': '1',
	'2': '2',
	'3': '3'
} as const;

export interface FlukaDefaultsJSON {
	flukaDefaults: string;
}

const _default = {
	defaults: FLUKA_DEFAULTS['1']
};

export class FlukaDefaults {
	defaults: string = 'FlukaDefaults';

	constructor() {}

	reset(): void {}

	toJSON() {
		const {} = this;

		const jsonObject: FlukaDefaultsJSON = {
			flukaDefaults: ''
		};

		return jsonObject;
	}

	fromJSON(data: FlukaDefaultsJSON) {
		const loadedData = { ..._default, ...data };

		return this;
	}

	static fromJSON(data: FlukaDefaultsJSON) {
		return new FlukaDefaults().fromJSON(data);
	}
}

export const isPhysic = (x: unknown): x is FlukaDefaults => x instanceof FlukaDefaults;
