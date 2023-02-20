
export const ENERGY_MODEL_STRAGGLE = {
    'no straggling': 'no straggling',
    'Gaussian': 'Gaussian',
    'Vavilov': 'Vavilov',
} as const;
export type EnergyModelStraggle = keyof typeof ENERGY_MODEL_STRAGGLE;

export const MULTIPLE_SCATTERING = {
    'no scattering': 'no scattering',
    'Gaussian': 'Gaussian',
    'Moliere': 'Moliere',
} as const;
export type MultipleScattering = keyof typeof MULTIPLE_SCATTERING;

export interface PhysicJSON {
    energyLoss: number;
    enableNuclearReactions: boolean;
    energyModelStraggle: EnergyModelStraggle;
    multipleScattering: MultipleScattering;
}


const _default = {
    energyLoss: 0.03,
    enableNuclearReactions: true,
    energyModelStraggle: ENERGY_MODEL_STRAGGLE['Vavilov'],
    multipleScattering: MULTIPLE_SCATTERING['Moliere'],
}

export class Physic {

    energyLoss: number;
    enableNuclearReactions: boolean;
    energyModelStraggle: EnergyModelStraggle;
    multipleScattering: MultipleScattering;

    constructor() {
        this.energyLoss = _default.energyLoss;
        this.enableNuclearReactions = _default.enableNuclearReactions;
        this.energyModelStraggle = _default.energyModelStraggle;
        this.multipleScattering = _default.multipleScattering;
    }

    reset(): void {
        this.energyLoss = _default.energyLoss;
        this.enableNuclearReactions = _default.enableNuclearReactions;
        this.energyModelStraggle = _default.energyModelStraggle;
        this.multipleScattering = _default.multipleScattering;
    }

    toJSON() {
        const jsonObject: PhysicJSON = {
            energyLoss: this.energyLoss,
            enableNuclearReactions: this.enableNuclearReactions,
            energyModelStraggle: this.energyModelStraggle,
            multipleScattering: this.multipleScattering,
        };

        return jsonObject;
    }

    fromJSON(data: PhysicJSON) {
        const loadedData = { ..._default, ...data };
        this.energyLoss = loadedData.energyLoss;
        this.enableNuclearReactions = loadedData.enableNuclearReactions;
        this.energyModelStraggle = loadedData.energyModelStraggle;
        this.multipleScattering = loadedData.multipleScattering;

        return this;
    }

    static fromJSON(data: PhysicJSON) {
        return new Physic().fromJSON(data);
    }
}

export const isPhysic = (x: unknown): x is Physic => x instanceof Physic;