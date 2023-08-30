import { StoppingPowerFile } from '../CustomStoppingPower/CustomStoppingPower';
import { Icru } from '../Materials/MaterialManager';

export const ENERGY_MODEL_STRAGGLING = {
	'no straggling': 'no straggling',
	'Gaussian': 'Gaussian',
	'Vavilov': 'Vavilov'
} as const;
export type EnergyModelStraggling = keyof typeof ENERGY_MODEL_STRAGGLING;

export const MULTIPLE_SCATTERING = {
	'no scattering': 'no scattering',
	'Gaussian': 'Gaussian',
	'Moliere': 'Moliere'
} as const;
export type MultipleScattering = keyof typeof MULTIPLE_SCATTERING;

//stopping power table
export const STOPPING_POWER_TABLE = {
	ICRU49: 'ICRU49',
	ICRU91: 'ICRU91'
} as const;
export type StoppingPowerTable = keyof typeof STOPPING_POWER_TABLE;

export interface PhysicJSON {
	energyLoss: number;
	enableNuclearReactions: boolean;
	energyModelStraggling: EnergyModelStraggling;
	multipleScattering: MultipleScattering;
	stoppingPowerTable: StoppingPowerTable;

	availableStoppingPowerFiles?: Record<Icru, StoppingPowerFile>; // For converter needs
}

const _default = {
	energyLoss: 0.03,
	enableNuclearReactions: true,
	energyModelStraggling: ENERGY_MODEL_STRAGGLING['Vavilov'],
	multipleScattering: MULTIPLE_SCATTERING['Moliere'],
	stoppingPowerTable: STOPPING_POWER_TABLE.ICRU91
};

export class Physics {
	energyLoss: number;
	enableNuclearReactions: boolean;
	energyModelStraggling: EnergyModelStraggling;
	multipleScattering: MultipleScattering;
	stoppingPowerTable: StoppingPowerTable;

	constructor() {
		this.energyLoss = _default.energyLoss;
		this.enableNuclearReactions = _default.enableNuclearReactions;
		this.energyModelStraggling = _default.energyModelStraggling;
		this.multipleScattering = _default.multipleScattering;
		this.stoppingPowerTable = _default.stoppingPowerTable;
	}

	reset(): void {
		this.energyLoss = _default.energyLoss;
		this.enableNuclearReactions = _default.enableNuclearReactions;
		this.energyModelStraggling = _default.energyModelStraggling;
		this.multipleScattering = _default.multipleScattering;
		this.stoppingPowerTable = _default.stoppingPowerTable;
	}

	toJSON() {
		const {
			energyLoss,
			enableNuclearReactions,
			energyModelStraggling,
			multipleScattering,
			stoppingPowerTable
		} = this;

		const jsonObject: PhysicJSON = {
			energyLoss,
			enableNuclearReactions,
			energyModelStraggling,
			multipleScattering,
			stoppingPowerTable
		};

		return jsonObject;
	}

	fromJSON(data: PhysicJSON) {
		const loadedData = { ..._default, ...data };
		this.energyLoss = loadedData.energyLoss;
		this.enableNuclearReactions = loadedData.enableNuclearReactions;
		this.energyModelStraggling = loadedData.energyModelStraggling;
		this.multipleScattering = loadedData.multipleScattering;
		this.stoppingPowerTable = loadedData.stoppingPowerTable;

		return this;
	}

	static fromJSON(data: PhysicJSON) {
		return new Physics().fromJSON(data);
	}
}

export const isPhysic = (x: unknown): x is Physics => x instanceof Physics;
