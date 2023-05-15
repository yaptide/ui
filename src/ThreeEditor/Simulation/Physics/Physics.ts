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

export interface PhysicJSON {
	energyLoss: number;
	enableNuclearReactions: boolean;
	energyModelStraggling: EnergyModelStraggling;
	multipleScattering: MultipleScattering;
}

const _default = {
	energyLoss: 0.03,
	enableNuclearReactions: true,
	energyModelStraggling: ENERGY_MODEL_STRAGGLING['Vavilov'],
	multipleScattering: MULTIPLE_SCATTERING['Moliere']
};

export class Physics {
	energyLoss: number;
	enableNuclearReactions: boolean;
	energyModelStraggling: EnergyModelStraggling;
	multipleScattering: MultipleScattering;

	constructor() {
		this.energyLoss = _default.energyLoss;
		this.enableNuclearReactions = _default.enableNuclearReactions;
		this.energyModelStraggling = _default.energyModelStraggling;
		this.multipleScattering = _default.multipleScattering;
	}

	reset(): void {
		this.energyLoss = _default.energyLoss;
		this.enableNuclearReactions = _default.enableNuclearReactions;
		this.energyModelStraggling = _default.energyModelStraggling;
		this.multipleScattering = _default.multipleScattering;
	}

	toJSON() {
		const jsonObject: PhysicJSON = {
			energyLoss: this.energyLoss,
			enableNuclearReactions: this.enableNuclearReactions,
			energyModelStraggling: this.energyModelStraggling,
			multipleScattering: this.multipleScattering
		};

		return jsonObject;
	}

	fromJSON(data: PhysicJSON) {
		const loadedData = { ..._default, ...data };
		this.energyLoss = loadedData.energyLoss;
		this.enableNuclearReactions = loadedData.enableNuclearReactions;
		this.energyModelStraggling = loadedData.energyModelStraggling;
		this.multipleScattering = loadedData.multipleScattering;

		return this;
	}

	static fromJSON(data: PhysicJSON) {
		return new Physics().fromJSON(data);
	}
}

export const isPhysic = (x: unknown): x is Physics => x instanceof Physics;
