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

export type DETECTOR_KEYWORD = keyof typeof DETECTOR_KEYWORD_DESCRIPTION;

const PER_PRIMARY_KEYWORD = [
	'1MeVNEq',
	'Alanine',
	'Dose',
	'DoseEqv',
	'DDD',
	'DoseGy',
	'Energy',
	'EqvDose',
	'Fluence',
	'NEqvDose',
	'NKERMA'
] as const;
const N_K_MEDIUM_OVERRIDE_KEYWORD = ['NKERMA', 'NEqvDose'] as const;
const MATERIAL_MEDIUM_OVERRIDE_KEYWORD = [
	'dLET',
	'tLET',
	'Dose',
	'dQ',
	'dQeff',
	'DoseGy',
	'DDD'
] as const;

export function canChangePrimaryMultiplier(
	keyword: DETECTOR_KEYWORD
): keyword is (typeof PER_PRIMARY_KEYWORD)[number] {
	return PER_PRIMARY_KEYWORD.includes(keyword);
}

export function canChangeNKMedium(
	keyword: DETECTOR_KEYWORD
): keyword is (typeof N_K_MEDIUM_OVERRIDE_KEYWORD)[number] {
	return N_K_MEDIUM_OVERRIDE_KEYWORD.includes(keyword);
}

export function canChangeMaterialMedium(
	keyword: DETECTOR_KEYWORD
): keyword is (typeof MATERIAL_MEDIUM_OVERRIDE_KEYWORD)[number] {
	return MATERIAL_MEDIUM_OVERRIDE_KEYWORD.includes(keyword);
}

export const DETECTOR_MODIFIERS_DESCRIPTION = {
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

export type DETECTOR_MODIFIERS = keyof typeof DETECTOR_MODIFIERS_DESCRIPTION;

export type DETECTOR_KEYWORDS = keyof typeof DETECTOR_KEYWORD_DESCRIPTION;

export const DETECTOR_MODIFIERS_OPTIONS = Object.keys(DETECTOR_MODIFIERS_DESCRIPTION).reduce(
	(acc, key) => {
		return { ...acc, [key]: key };
	},
	{} as Record<DETECTOR_MODIFIERS, DETECTOR_MODIFIERS>
);

export const DETECTOR_KEYWORD_OPTIONS = Object.keys(DETECTOR_KEYWORD_DESCRIPTION).reduce(
	(acc, key) => {
		return { ...acc, [key]: key };
	},
	{} as Record<DETECTOR_KEYWORDS, DETECTOR_KEYWORDS>
);

const FLUKA_DETECTOR_KEYWORD = ['Dose', 'Fluence'] as const;

export const FLUKA_DETECTOR_KEYWORD_OPTIONS = Object.keys(DETECTOR_KEYWORD_DESCRIPTION).reduce(
	(acc, key) => {
		if (FLUKA_DETECTOR_KEYWORD.includes(key)) {
			return { ...acc, [key]: key };
		}

		return acc;
	},
	{} as Record<DETECTOR_KEYWORDS, DETECTOR_KEYWORDS>
);

const FLUKA_ZONE_KEYWORDS = ['Dose', 'Fluence'] as const;

export const FLUKA_ZONE_KEYWORD_OPTIONS = Object.keys(DETECTOR_KEYWORD_DESCRIPTION).reduce(
	(acc, key) => {
		if (FLUKA_ZONE_KEYWORDS.includes(key)) {
			return { ...acc, [key]: key };
		}

		return acc;
	},
	{} as Record<DETECTOR_KEYWORDS, DETECTOR_KEYWORDS>
);

const FLUKA_ZONE_MODIFIERS = ['E', 'ENUC'] as const;

export const FLUKA_ZONE_MODIFIERS_OPTIONS = Object.keys(DETECTOR_MODIFIERS_DESCRIPTION).reduce(
	(acc, key) => {
		if (FLUKA_ZONE_MODIFIERS.includes(key)) {
			return { ...acc, [key]: key };
		}

		return acc;
	},
	{} as Record<DETECTOR_MODIFIERS, DETECTOR_MODIFIERS>
);

export type MEDIUM = keyof typeof MEDIUM_KEYWORDS;

export const MEDIUM_KEYWORD_OPTIONS = Object.keys(MEDIUM_KEYWORDS).reduce(
	(acc, key) => {
		return { ...acc, [key]: key };
	},
	{} as Record<MEDIUM, MEDIUM>
);

export type SCORING_TYPE = keyof typeof SCORING_TYPE_ENUM;

export enum SCORING_TYPE_ENUM {
	DETECTOR = 'DETECTOR',
	ZONE = 'ZONE'
}
