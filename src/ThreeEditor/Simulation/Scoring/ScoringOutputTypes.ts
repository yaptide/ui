import { SimulatorType } from '../../../types/RequestTypes';

export enum DETECTOR_KEYWORD {
	'1MeVNEq' = '1MeVNEq',
	'Alanine' = 'Alanine',
	'AvgBeta' = 'AvgBeta',
	'AvgEnergy' = 'AvgEnergy',
	'Dose' = 'Dose',
	'DoseEqv' = 'DoseEqv',
	'DDD' = 'DDD',
	'DoseGy' = 'DoseGy',
	'dLET' = 'dLET',
	'dQ' = 'dQ',
	'dQeff' = 'dQeff',
	'Energy' = 'Energy',
	'EqvDose' = 'EqvDose',
	'Fluence' = 'Fluence',
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
	'tZeff2Beta2' = 'tZeff2Beta2'
}

export const DETECTOR_KEYWORD_DESCRIPTION = {
	'1MeVNEq':
		'1-MeV neutron equivalent fluence [cm−2]. Only scored for neutrons, protons and pions.Multiply with 2.037e-3 to get DNIEL in [MeV / g]',
	'Alanine':
		'Alanine quenching model for ions, scores Dose * RE(z,E). Based on Bassler et al. NIMB;2008;266(6);929-936',
	'AvgBeta': 'Track-averaged β, where β = v/c',
	'AvgEnergy': 'Average kinetic energy of the particle in [MeV/nucleon]',
	'Dose': 'Dose [MeV/g]',
	'DoseEqv': 'Dose-Equivalent (see notes below) [Sv]',
	'DDD': 'as Dose, but specially for TRiP98 depth-dose kernel file generation',
	'DoseGy': 'Dose [Gy]',
	'dLET': 'Dose-averaged LET [MeV/cm]',
	'dQ': 'Dose-averaged Q',
	'dQeff': 'Dose-averaged Qeff',
	'Energy': 'Total amount of energy deposited [MeV]',
	'EqvDose': 'Equivalent dose (see notes below) [Sv]',
	'Fluence': 'Fluence [/cm2]',
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
	'tZeff2Beta2': 'Track-averaged Zeff²/beta²'
} as const;

export function canChangePrimaryMultiplier(
	simulator: SimulatorType,
	scoringType: 'DETECTOR' | 'ZONE',
	keyword: DETECTOR_KEYWORD
): boolean {
	return configurationExists(simulator, scoringType, keyword, CONFIGURATION_OPTIONS.PER_PRIMARY);
}

export function canChangeNKMedium(
	simulator: SimulatorType,
	scoringType: 'DETECTOR' | 'ZONE',
	keyword: DETECTOR_KEYWORD
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
	scoringType: 'DETECTOR' | 'ZONE',
	keyword: DETECTOR_KEYWORD
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
	scoringType: 'DETECTOR' | 'ZONE',
	keyword: DETECTOR_KEYWORD,
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

	return SCORING_OPTIONS[simulator.toUpperCase()][scoringType.toUpperCase()][
		keyword
	]?.configuration.has(configuration);
}

export enum DETECTOR_MODIFIERS {
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

const DETECTOR_MODIFIERS_DESCRIPTION = {
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

export function getModifierDescription(modifier: DETECTOR_MODIFIERS): string {
	return DETECTOR_MODIFIERS_DESCRIPTION[modifier];
}

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

interface NestedDictionary {
	[key: string]: {
		[key: string]: {
			[key: string]: {
				configuration: Set<CONFIGURATION_OPTIONS>;
				modifiers: Set<DETECTOR_MODIFIERS>;
			};
		};
	};
}

export const SCORING_OPTIONS: NestedDictionary = {
	SHIELDHIT: {
		DETECTOR: {
			'1MeVNEq': {
				configuration: new Set([CONFIGURATION_OPTIONS.PER_PRIMARY]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'Alanine': {
				configuration: new Set([CONFIGURATION_OPTIONS.PER_PRIMARY]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'AvgBeta': {
				configuration: new Set([]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'AvgEnergy': {
				configuration: new Set([]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'Dose': {
				configuration: new Set([
					CONFIGURATION_OPTIONS.PER_PRIMARY,
					CONFIGURATION_OPTIONS.MATERIAL_MEDIUM_OVERRIDE
				]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'DoseEqv': {
				configuration: new Set([CONFIGURATION_OPTIONS.PER_PRIMARY]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'DDD': {
				configuration: new Set([
					CONFIGURATION_OPTIONS.PER_PRIMARY,
					CONFIGURATION_OPTIONS.MATERIAL_MEDIUM_OVERRIDE
				]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'DoseGy': {
				configuration: new Set([
					CONFIGURATION_OPTIONS.PER_PRIMARY,
					CONFIGURATION_OPTIONS.MATERIAL_MEDIUM_OVERRIDE
				]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'dLET': {
				configuration: new Set([CONFIGURATION_OPTIONS.MATERIAL_MEDIUM_OVERRIDE]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'dQ': {
				configuration: new Set([CONFIGURATION_OPTIONS.MATERIAL_MEDIUM_OVERRIDE]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'dQeff': {
				configuration: new Set([CONFIGURATION_OPTIONS.MATERIAL_MEDIUM_OVERRIDE]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'Energy': {
				configuration: new Set([CONFIGURATION_OPTIONS.PER_PRIMARY]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'EqvDose': {
				configuration: new Set([CONFIGURATION_OPTIONS.PER_PRIMARY]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'Fluence': {
				configuration: new Set([CONFIGURATION_OPTIONS.PER_PRIMARY]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'MATERIAL': {
				configuration: new Set([]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'NEqvDose': {
				configuration: new Set([
					CONFIGURATION_OPTIONS.PER_PRIMARY,
					CONFIGURATION_OPTIONS.N_K_MEDIUM_OVERRIDE
				]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'NKERMA': {
				configuration: new Set([
					CONFIGURATION_OPTIONS.PER_PRIMARY,
					CONFIGURATION_OPTIONS.N_K_MEDIUM_OVERRIDE
				]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'ZONE': {
				configuration: new Set([]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'Rho': {
				configuration: new Set([]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'tQ': {
				configuration: new Set([]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'tQeff': {
				configuration: new Set([]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'tLET': {
				configuration: new Set([CONFIGURATION_OPTIONS.MATERIAL_MEDIUM_OVERRIDE]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'dZ2Beta2': {
				configuration: new Set([]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'tZ2Beta2': {
				configuration: new Set([]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'dZeff2Beta2': {
				configuration: new Set([]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			},
			'tZeff2Beta2': {
				configuration: new Set([]),
				modifiers: new Set([
					DETECTOR_MODIFIERS.ANGLE,
					DETECTOR_MODIFIERS.DEDX,
					DETECTOR_MODIFIERS.E,
					DETECTOR_MODIFIERS.EAMU,
					DETECTOR_MODIFIERS.ENUC,
					DETECTOR_MODIFIERS.MDEDX,
					DETECTOR_MODIFIERS.TL,
					DETECTOR_MODIFIERS.Z,
					DETECTOR_MODIFIERS.Zeff,
					DETECTOR_MODIFIERS.Z2Beta2,
					DETECTOR_MODIFIERS.Zeff2Beta2
				])
			}
		},
		ZONE: {
			Energy: {
				configuration: new Set([CONFIGURATION_OPTIONS.PER_PRIMARY]),
				modifiers: new Set([DETECTOR_MODIFIERS.E])
			}
		}
	},
	FLUKA: {
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
				modifiers: new Set([DETECTOR_MODIFIERS.E, DETECTOR_MODIFIERS.ENUC])
			},
			Energy: {
				configuration: new Set([CONFIGURATION_OPTIONS.PER_PRIMARY]),
				modifiers: new Set([])
			}
		}
	}
};

export type DETECTOR_KEYWORDS = keyof typeof DETECTOR_KEYWORD_DESCRIPTION;

export const DETECTOR_MODIFIERS_OPTIONS_TYPE = Object.keys(DETECTOR_MODIFIERS_DESCRIPTION).reduce(
	(acc, key) => {
		return { ...acc, [key]: key };
	},
	{} as Record<DETECTOR_MODIFIERS, DETECTOR_MODIFIERS>
);

export const SHIELDHIT_DETECTOR_KEYWORD_OPTIONS = Object.keys(
	SCORING_OPTIONS.SHIELDHIT.DETECTOR
).reduce(
	(acc, key) => {
		return { ...acc, [key]: key };
	},
	{} as Record<DETECTOR_KEYWORDS, DETECTOR_KEYWORDS>
);

export const FLUKA_DETECTOR_KEYWORD_OPTIONS = Object.keys(SCORING_OPTIONS.FLUKA.DETECTOR).reduce(
	(acc, key) => {
		return { ...acc, [key]: key };
	},
	{} as Record<DETECTOR_KEYWORDS, DETECTOR_KEYWORDS>
);

export type MEDIUM = keyof typeof MEDIUM_KEYWORDS;

export const MEDIUM_KEYWORD_OPTIONS = Object.keys(MEDIUM_KEYWORDS).reduce(
	(acc, key) => {
		return { ...acc, [key]: key };
	},
	{} as Record<MEDIUM, MEDIUM>
);

export function getQuantityModifiersOptions(
	simulator: SimulatorType,
	scoringType: string,
	keyword: DETECTOR_KEYWORD
) {
	return SCORING_OPTIONS[simulator.toUpperCase()][scoringType.toUpperCase()][keyword]?.modifiers;
}
