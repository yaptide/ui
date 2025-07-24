import { SimulatorType } from '../../../types/RequestTypes';

export enum SCORING_KEYWORD {
	// common
	'1MeVNEq' = '1MeVNEq',
	'Alanine' = 'Alanine',
	'AvgBeta' = 'AvgBeta',
	'AvgEnergy' = 'AvgEnergy',
	'Dose' = 'Dose',
	'DoseEqv' = 'DoseEqv',
	'DDD' = 'DDD',
	'dLET' = 'dLET',
	'dQ' = 'dQ',
	'dQeff' = 'dQeff',
	'EqvDose' = 'EqvDose',
	'MATERIAL' = 'MATERIAL',
	'NEqvDose' = 'NEqvDose',
	'NKERMA' = 'NKERMA',
	'ZONE' = 'ZONE',
	'Rho' = 'Rho',
	'tQ' = 'tQ',
	'tQeff' = 'tQeff',
	'tLET' = 'tLET',
	'dZ2Beta2' = 'dZ2Beta2',
	'tZ2Beta2' = 'tZ2Beta2',
	'dZeff2Beta2' = 'dZeff2Beta2',
	'tZeff2Beta2' = 'tZeff2Beta2',
	// Geant4 + common
	'DoseGy' = 'DoseGy',
	'Energy' = 'Energy',
	'Fluence' = 'Fluence',
	// Geant4 only
	'KineticEnergySpectrum' = 'KineticEnergySpectrum'
}

export const SCORING_KEYWORD_DESCRIPTION = {
	// common
	'1MeVNEq':
		'1-MeV neutron equivalent fluence [cm−2]. Only scored for neutrons, protons and pions.Multiply with 2.037e-3 to get DNIEL in [MeV / g]',
	'Alanine':
		'Alanine quenching model for ions, scores Dose * RE(z,E). Based on Bassler et al. NIMB;2008;266(6);929-936',
	'AvgBeta': 'Track-averaged β, where β = v/c',
	'AvgEnergy': 'Average kinetic energy of the particle in [MeV/nucleon]',
	'Dose': 'Dose [MeV/g]',
	'DoseEqv': 'Dose-Equivalent (see notes below) [Sv]',
	'DDD': 'as Dose, but specially for TRiP98 depth-dose kernel file generation',
	'dLET': 'Dose-averaged LET [MeV/cm]',
	'dQ': 'Dose-averaged Q',
	'dQeff': 'Dose-averaged Qeff',
	'EqvDose': 'Equivalent dose (see notes below) [Sv]',
	'MATERIAL': 'Maps material ID as assigned in geo.dat. Useful for debugging geometries.',
	'NEqvDose': 'Equivalent dose from neutron kerma (see notes below) [Sv]',
	'NKERMA': 'Neutron Kerma in [Gy]',
	'ZONE': 'Maps zone number. Useful for debugging geometries',
	'Rho': 'Maps material density as assigned in geo.dat and mat.dat [g/cm³]. Useful for debugging geometries.',
	'tQ': 'Track-averaged Q',
	'tQeff': 'Track-averaged Qeff',
	'tLET': 'Track-averaged LET [MeV/cm]',
	'dZ2Beta2': 'Dose-averaged Z²/beta²',
	'tZ2Beta2': 'Track-averaged Z²/beta²',
	'dZeff2Beta2': 'Dose-averaged Zeff²/beta²',
	'tZeff2Beta2': 'Track-averaged Zeff²/beta²',
	// Geant4 + common
	'DoseGy': 'Dose [Gy]',
	'Energy': 'Total amount of energy deposited [MeV]',
	'Fluence': 'Fluence [/cm2]',
	// Geant4 only
	'KineticEnergySpectrum': 'Fluence [/cm2] wrt. kinetic energy [MeV]'
} as const;

export enum SCORING_MODIFIERS {
	ANGLE = 'ANGLE',
	DEDX = 'DEDX',
	E = 'E',
	EAMU = 'EAMU',
	ENUC = 'ENUC',
	MDEDX = 'MDEDX',
	TL = 'TL',
	Z = 'Z',
	Zeff = 'Zeff',
	Z2Beta2 = 'Z2Beta2',
	Zeff2Beta2 = 'Zeff2Beta2'
}

const SCORING_MODIFIERS_DESCRIPTION = {
	ANGLE: 'Differential in angle [deg]',
	DEDX: 'Differential in unrestricted electronic stopping power [MeV/cm]',
	E: 'Differential in kinetic energy [MeV]',
	EAMU: 'Differential in kinetic energy per amu [MeV/amu]',
	ENUC: 'Differential in kinetic energy per nucleon [MeV/n]',
	MDEDX: 'Differential in electronic mass stopping power [MeV cm²/g]',
	TL: 'Differential in track length [cm]',
	Z: 'Differential in projectile change',
	Zeff: 'Differential in effective projectile charge [Zeff]',
	Z2Beta2: 'Differential in [Z²/beta²]',
	Zeff2Beta2: 'Differential in [Zeff²/beta²]'
} as const;

export const MEDIUM_KEYWORDS = {
	A150: 'Tissue-equivalent A-150 plastic.',
	AIR: 'Air, sea-level dry.',
	BONE: 'Bone tissue.',
	Muscule: 'Muscule tissue.',
	TE_Methane: 'Tissue-equivalent gas, methane based.',
	TE_Propane: 'Tissue-equivalent gas, propane based.',
	WATER: 'Water, sea-level dry.'
};

export enum CONFIGURATION_OPTIONS {
	PER_PRIMARY = 'PER_PRIMARY',
	MATERIAL_MEDIUM_OVERRIDE = 'MATERIAL_MEDIUM_OVERRIDE',
	N_K_MEDIUM_OVERRIDE = 'N_K_MEDIUM_OVERRIDE'
}

interface IScoringOptions {
	[key: string]: {
		[key: string]: {
			[key: string]: {
				configuration: Set<CONFIGURATION_OPTIONS>;
				modifiers: Set<SCORING_MODIFIERS>;
			};
		};
	};
}

export const SCORING_OPTIONS: IScoringOptions = {
	[SimulatorType.SHIELDHIT]: {
		DETECTOR: {
			'1MeVNEq': {
				configuration: new Set([CONFIGURATION_OPTIONS.PER_PRIMARY]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'Alanine': {
				configuration: new Set([CONFIGURATION_OPTIONS.PER_PRIMARY]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'AvgBeta': {
				configuration: new Set([]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'AvgEnergy': {
				configuration: new Set([]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'Dose': {
				configuration: new Set([
					CONFIGURATION_OPTIONS.PER_PRIMARY,
					CONFIGURATION_OPTIONS.MATERIAL_MEDIUM_OVERRIDE
				]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'DoseEqv': {
				configuration: new Set([CONFIGURATION_OPTIONS.PER_PRIMARY]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'DDD': {
				configuration: new Set([
					CONFIGURATION_OPTIONS.PER_PRIMARY,
					CONFIGURATION_OPTIONS.MATERIAL_MEDIUM_OVERRIDE
				]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'DoseGy': {
				configuration: new Set([
					CONFIGURATION_OPTIONS.PER_PRIMARY,
					CONFIGURATION_OPTIONS.MATERIAL_MEDIUM_OVERRIDE
				]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'dLET': {
				configuration: new Set([CONFIGURATION_OPTIONS.MATERIAL_MEDIUM_OVERRIDE]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'dQ': {
				configuration: new Set([CONFIGURATION_OPTIONS.MATERIAL_MEDIUM_OVERRIDE]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'dQeff': {
				configuration: new Set([CONFIGURATION_OPTIONS.MATERIAL_MEDIUM_OVERRIDE]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'Energy': {
				configuration: new Set([CONFIGURATION_OPTIONS.PER_PRIMARY]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'EqvDose': {
				configuration: new Set([CONFIGURATION_OPTIONS.PER_PRIMARY]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'Fluence': {
				configuration: new Set([CONFIGURATION_OPTIONS.PER_PRIMARY]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'MATERIAL': {
				configuration: new Set([]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'NEqvDose': {
				configuration: new Set([
					CONFIGURATION_OPTIONS.PER_PRIMARY,
					CONFIGURATION_OPTIONS.N_K_MEDIUM_OVERRIDE
				]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'NKERMA': {
				configuration: new Set([
					CONFIGURATION_OPTIONS.PER_PRIMARY,
					CONFIGURATION_OPTIONS.N_K_MEDIUM_OVERRIDE
				]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'ZONE': {
				configuration: new Set([]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'Rho': {
				configuration: new Set([]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'tQ': {
				configuration: new Set([]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'tQeff': {
				configuration: new Set([]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'tLET': {
				configuration: new Set([CONFIGURATION_OPTIONS.MATERIAL_MEDIUM_OVERRIDE]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'dZ2Beta2': {
				configuration: new Set([]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'tZ2Beta2': {
				configuration: new Set([]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'dZeff2Beta2': {
				configuration: new Set([]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			},
			'tZeff2Beta2': {
				configuration: new Set([]),
				modifiers: new Set([
					SCORING_MODIFIERS.ANGLE,
					SCORING_MODIFIERS.DEDX,
					SCORING_MODIFIERS.E,
					SCORING_MODIFIERS.EAMU,
					SCORING_MODIFIERS.ENUC,
					SCORING_MODIFIERS.MDEDX,
					SCORING_MODIFIERS.TL,
					SCORING_MODIFIERS.Z,
					SCORING_MODIFIERS.Zeff,
					SCORING_MODIFIERS.Z2Beta2,
					SCORING_MODIFIERS.Zeff2Beta2
				])
			}
		},
		ZONE: {
			Energy: {
				configuration: new Set([CONFIGURATION_OPTIONS.PER_PRIMARY]),
				modifiers: new Set([SCORING_MODIFIERS.E])
			}
		}
	},
	[SimulatorType.FLUKA]: {
		DETECTOR: {
			Fluence: {
				configuration: new Set([CONFIGURATION_OPTIONS.PER_PRIMARY]),
				modifiers: new Set([])
			},
			Dose: {
				configuration: new Set([CONFIGURATION_OPTIONS.PER_PRIMARY]),
				modifiers: new Set([])
			}
		},
		ZONE: {
			Fluence: {
				configuration: new Set([CONFIGURATION_OPTIONS.PER_PRIMARY]),
				modifiers: new Set([SCORING_MODIFIERS.E, SCORING_MODIFIERS.ENUC])
			},
			Dose: {
				configuration: new Set([CONFIGURATION_OPTIONS.PER_PRIMARY]),
				modifiers: new Set([])
			}
		}
	},
	[SimulatorType.GEANT4]: {
		DETECTOR: {
			DoseGy: { configuration: new Set([]), modifiers: new Set([]) },
			Energy: { configuration: new Set([]), modifiers: new Set([]) },
			Fluence: { configuration: new Set([]), modifiers: new Set([]) },
			KineticEnergySpectrum: { configuration: new Set([]), modifiers: new Set([]) }
		}
	}
};

export type DETECTOR_KEYWORDS_TYPE = keyof typeof SCORING_KEYWORD_DESCRIPTION;

export type SCORING_MODIFIERS_TYPE = keyof typeof SCORING_MODIFIERS;

export type MEDIUM = keyof typeof MEDIUM_KEYWORDS;

export const MEDIUM_KEYWORD_OPTIONS = Object.keys(MEDIUM_KEYWORDS).reduce(
	(acc, key) => {
		return { ...acc, [key]: key };
	},
	{} as Record<MEDIUM, MEDIUM>
);

export enum SCORING_TYPE_ENUM {
	DETECTOR = 'DETECTOR',
	ZONE = 'ZONE'
}

export function canChangePrimaryMultiplier(
	simulator: SimulatorType,
	scoringType: SCORING_TYPE_ENUM,
	keyword: SCORING_KEYWORD
): boolean {
	return configurationExists(simulator, scoringType, keyword, CONFIGURATION_OPTIONS.PER_PRIMARY);
}

export function canChangeNKMedium(
	simulator: SimulatorType,
	scoringType: SCORING_TYPE_ENUM,
	keyword: SCORING_KEYWORD
): boolean {
	return configurationExists(
		simulator,
		scoringType,
		keyword,
		CONFIGURATION_OPTIONS.N_K_MEDIUM_OVERRIDE
	);
}

export function canChangeMaterialMedium(
	simulator: SimulatorType,
	scoringType: SCORING_TYPE_ENUM,
	keyword: SCORING_KEYWORD
): boolean {
	return configurationExists(
		simulator,
		scoringType,
		keyword,
		CONFIGURATION_OPTIONS.MATERIAL_MEDIUM_OVERRIDE
	);
}

function configurationExists(
	simulator: SimulatorType,
	scoringType: SCORING_TYPE_ENUM,
	keyword: SCORING_KEYWORD,
	configuration: CONFIGURATION_OPTIONS
): boolean {
	if (!keyword) {
		return false;
	}

	if (simulator === SimulatorType.COMMON) {
		return (
			configurationExists(SimulatorType.SHIELDHIT, scoringType, keyword, configuration) &&
			configurationExists(SimulatorType.FLUKA, scoringType, keyword, configuration)
		);
	}

	return SCORING_OPTIONS[simulator][scoringType][keyword]?.configuration.has(configuration);
}

export function getQuantityTypeOptions(
	simulatorType: SimulatorType,
	scoringType: SCORING_TYPE_ENUM
) {
	if (simulatorType === SimulatorType.COMMON) {
		const shieldhitOptions = new Set(
			Object.keys(SCORING_OPTIONS[SimulatorType.SHIELDHIT][scoringType])
		);

		const flukaOptions = new Set(
			Object.keys(SCORING_OPTIONS[SimulatorType.FLUKA][scoringType])
		);

		const commonOptions = Array.from(shieldhitOptions).filter(option =>
			flukaOptions.has(option)
		);

		return commonOptions.reduce(
			(acc, key) => {
				return { ...acc, [key]: key };
			},
			{} as Record<DETECTOR_KEYWORDS_TYPE, DETECTOR_KEYWORDS_TYPE>
		);
	} else {
		return Object.keys(SCORING_OPTIONS[simulatorType][scoringType]).reduce(
			(acc, key) => {
				return { ...acc, [key]: key };
			},
			{} as Record<DETECTOR_KEYWORDS_TYPE, DETECTOR_KEYWORDS_TYPE>
		);
	}
}

export function getModifierDescription(modifier: SCORING_MODIFIERS): string {
	return SCORING_MODIFIERS_DESCRIPTION[modifier];
}

export function getQuantityModifiersOptions(
	simulatorType: SimulatorType,
	scoringType: string,
	keyword: SCORING_KEYWORD
): Set<SCORING_MODIFIERS> {
	if (!keyword || !scoringType) {
		return new Set();
	}

	if (simulatorType === SimulatorType.COMMON) {
		return getQuantityModifiersOptions(
			SimulatorType.SHIELDHIT,
			scoringType,
			keyword
		).intersection(getQuantityModifiersOptions(SimulatorType.FLUKA, scoringType, keyword));
	}

	return SCORING_OPTIONS[simulatorType][scoringType][keyword]?.modifiers;
}
