import { SimulatorType } from './RequestTypes';

export interface ParticleEntry {
	/** Unique identifier for the particle, e.g. 2212 for proton, 1000060120 for Carbon-12, etc. */
	pdg: number;

	/** Display name shown after selection, e.g. "Carbon-12", "Electron", "Proton" */
	displayName: string;

	/**
	 * All strings a user may type to find this entry.
	 * Matching is case-insensitive substring against every alias.
	 */
	aliases: readonly string[];

	/** Mass number (nucleons). Required for baryonic particles. */
	a?: number;

	/** Atomic / charge number. Required for baryonic particles. */
	z?: number;

	/**
	 * Natural isotopic abundance as a percentage (0–100).
	 * Source: IUPAC 2021 "Isotopic Compositions of the Elements" / NUBASE2020.
	 * Undefined for non-baryonic particles (electron, photon, pions, muons, etc.)
	 * and for particles with dedicated IDs (proton id:2, deuteron id:21, etc.)
	 * where "abundance" is not a meaningful concept.
	 *
	 * Used to:
	 *  - Derive "most abundant isotope" per element for bold + ★ rendering.
	 *  - Sort isotopes of the same element (highest abundance first).
	 *  - Optionally display in a tooltip.
	 */
	abundance?: number;

	/**
	 * Sort priority for the unfiltered dropdown list.
	 * Lower number = appears earlier. Default assumed 10 if omitted.
	 *
	 * Tier definitions:
	 *   0  = Everyday workhorse beams (Proton, Carbon-12)
	 *   1  = Very common (Neutron, Electron, Positron, Photon, Helium-4/Alpha)
	 *   2  = Frequently used ions & composites (Deuteron, Triton, He-3,
	 *         Nitrogen-14, Oxygen-16, Neon-20, Argon-40, Iron-56)
	 *   3  = Notable special-purpose (U-235, U-238, C-14, Pb-208, Si-28)
	 *  10  = All other isotopes and rarely used particles (default)
	 */
	sortPriority: number;

	/**
	 * Which simulators support this particle.
	 * Used by getParticlesForSimulator() to filter the catalogue.
	 */
	simulators: readonly SimulatorType[];
}

export const PARTICLE_CATALOGUE = [
	{
		pdg: 1000010020,
		displayName: 'Deuteron',
		aliases: ['deuteron', 'd', 'deuterium', 'H-2', '2H', 'hydrogen-2'],
		a: 2,
		z: 1,
		abundance: 0.0145,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000010030,
		displayName: 'Triton',
		aliases: ['triton', 't', 'tritium', 'H-3', '3H', 'hydrogen-3'],
		a: 3,
		z: 1,
		abundance: 0.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000020030,
		displayName: 'Helium-3',
		aliases: ['He-3', '3He', 'helium-3'],
		a: 3,
		z: 2,
		abundance: 0.0002,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000020040,
		displayName: 'Helium-4',
		aliases: ['He-4', '4He', 'helium-4'],
		a: 4,
		z: 2,
		abundance: 99.9998,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000030060,
		displayName: 'Lithium-6',
		aliases: ['Li-6', '6Li', 'lithium-6'],
		a: 6,
		z: 3,
		abundance: 4.85,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000030070,
		displayName: 'Lithium-7',
		aliases: ['Li-7', '7Li', 'lithium-7'],
		a: 7,
		z: 3,
		abundance: 95.15,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000040090,
		displayName: 'Beryllium-9',
		aliases: ['Be-9', '9Be', 'beryllium-9'],
		a: 9,
		z: 4,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000050100,
		displayName: 'Boron-10',
		aliases: ['B-10', '10B', 'boron-10'],
		a: 10,
		z: 5,
		abundance: 19.65,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000050110,
		displayName: 'Boron-11',
		aliases: ['B-11', '11B', 'boron-11'],
		a: 11,
		z: 5,
		abundance: 80.35,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000060120,
		displayName: 'Carbon-12',
		aliases: ['C-12', '12C', 'carbon-12'],
		a: 12,
		z: 6,
		abundance: 98.94,
		sortPriority: 0,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000060130,
		displayName: 'Carbon-13',
		aliases: ['C-13', '13C', 'carbon-13'],
		a: 13,
		z: 6,
		abundance: 1.06,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000070140,
		displayName: 'Nitrogen-14',
		aliases: ['N-14', '14N', 'nitrogen-14'],
		a: 14,
		z: 7,
		abundance: 99.6205,
		sortPriority: 2,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000070150,
		displayName: 'Nitrogen-15',
		aliases: ['N-15', '15N', 'nitrogen-15'],
		a: 15,
		z: 7,
		abundance: 0.3795,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000080160,
		displayName: 'Oxygen-16',
		aliases: ['O-16', '16O', 'oxygen-16'],
		a: 16,
		z: 8,
		abundance: 99.757,
		sortPriority: 2,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000080170,
		displayName: 'Oxygen-17',
		aliases: ['O-17', '17O', 'oxygen-17'],
		a: 17,
		z: 8,
		abundance: 0.03835,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000080180,
		displayName: 'Oxygen-18',
		aliases: ['O-18', '18O', 'oxygen-18'],
		a: 18,
		z: 8,
		abundance: 0.2045,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000090190,
		displayName: 'Fluorine-19',
		aliases: ['F-19', '19F', 'fluorine-19'],
		a: 19,
		z: 9,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000100200,
		displayName: 'Neon-20',
		aliases: ['Ne-20', '20Ne', 'neon-20'],
		a: 20,
		z: 10,
		abundance: 90.48,
		sortPriority: 2,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000100210,
		displayName: 'Neon-21',
		aliases: ['Ne-21', '21Ne', 'neon-21'],
		a: 21,
		z: 10,
		abundance: 0.27,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000100220,
		displayName: 'Neon-22',
		aliases: ['Ne-22', '22Ne', 'neon-22'],
		a: 22,
		z: 10,
		abundance: 9.25,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000110230,
		displayName: 'Sodium-23',
		aliases: ['Na-23', '23Na', 'sodium-23'],
		a: 23,
		z: 11,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000120240,
		displayName: 'Magnesium-24',
		aliases: ['Mg-24', '24Mg', 'magnesium-24'],
		a: 24,
		z: 12,
		abundance: 78.965,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000120250,
		displayName: 'Magnesium-25',
		aliases: ['Mg-25', '25Mg', 'magnesium-25'],
		a: 25,
		z: 12,
		abundance: 10.011,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000120260,
		displayName: 'Magnesium-26',
		aliases: ['Mg-26', '26Mg', 'magnesium-26'],
		a: 26,
		z: 12,
		abundance: 11.025,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000130270,
		displayName: 'Aluminum-27',
		aliases: ['Al-27', '27Al', 'aluminum-27'],
		a: 27,
		z: 13,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000140280,
		displayName: 'Silicon-28',
		aliases: ['Si-28', '28Si', 'silicon-28'],
		a: 28,
		z: 14,
		abundance: 92.2545,
		sortPriority: 3,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000140290,
		displayName: 'Silicon-29',
		aliases: ['Si-29', '29Si', 'silicon-29'],
		a: 29,
		z: 14,
		abundance: 4.672,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000140300,
		displayName: 'Silicon-30',
		aliases: ['Si-30', '30Si', 'silicon-30'],
		a: 30,
		z: 14,
		abundance: 3.0735,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000150310,
		displayName: 'Phosphorus-31',
		aliases: ['P-31', '31P', 'phosphorus-31'],
		a: 31,
		z: 15,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000160320,
		displayName: 'Sulfur-32',
		aliases: ['S-32', '32S', 'sulfur-32'],
		a: 32,
		z: 16,
		abundance: 94.85,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000160330,
		displayName: 'Sulfur-33',
		aliases: ['S-33', '33S', 'sulfur-33'],
		a: 33,
		z: 16,
		abundance: 0.763,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000160340,
		displayName: 'Sulfur-34',
		aliases: ['S-34', '34S', 'sulfur-34'],
		a: 34,
		z: 16,
		abundance: 4.365,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000160360,
		displayName: 'Sulfur-36',
		aliases: ['S-36', '36S', 'sulfur-36'],
		a: 36,
		z: 16,
		abundance: 0.0158,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000170350,
		displayName: 'Chlorine-35',
		aliases: ['Cl-35', '35Cl', 'chlorine-35'],
		a: 35,
		z: 17,
		abundance: 75.8,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000170370,
		displayName: 'Chlorine-37',
		aliases: ['Cl-37', '37Cl', 'chlorine-37'],
		a: 37,
		z: 17,
		abundance: 24.2,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000180360,
		displayName: 'Argon-36',
		aliases: ['Ar-36', '36Ar', 'argon-36'],
		a: 36,
		z: 18,
		abundance: 0.3336,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000180380,
		displayName: 'Argon-38',
		aliases: ['Ar-38', '38Ar', 'argon-38'],
		a: 38,
		z: 18,
		abundance: 0.0629,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000180400,
		displayName: 'Argon-40',
		aliases: ['Ar-40', '40Ar', 'argon-40'],
		a: 40,
		z: 18,
		abundance: 99.6035,
		sortPriority: 2,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000190390,
		displayName: 'Potassium-39',
		aliases: ['K-39', '39K', 'potassium-39'],
		a: 39,
		z: 19,
		abundance: 93.2581,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000190400,
		displayName: 'Potassium-40',
		aliases: ['K-40', '40K', 'potassium-40'],
		a: 40,
		z: 19,
		abundance: 0.0117,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000190410,
		displayName: 'Potassium-41',
		aliases: ['K-41', '41K', 'potassium-41'],
		a: 41,
		z: 19,
		abundance: 6.7302,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000200400,
		displayName: 'Calcium-40',
		aliases: ['Ca-40', '40Ca', 'calcium-40'],
		a: 40,
		z: 20,
		abundance: 96.941,
		sortPriority: 3,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000200420,
		displayName: 'Calcium-42',
		aliases: ['Ca-42', '42Ca', 'calcium-42'],
		a: 42,
		z: 20,
		abundance: 0.647,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000200430,
		displayName: 'Calcium-43',
		aliases: ['Ca-43', '43Ca', 'calcium-43'],
		a: 43,
		z: 20,
		abundance: 0.135,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000200440,
		displayName: 'Calcium-44',
		aliases: ['Ca-44', '44Ca', 'calcium-44'],
		a: 44,
		z: 20,
		abundance: 2.086,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000200460,
		displayName: 'Calcium-46',
		aliases: ['Ca-46', '46Ca', 'calcium-46'],
		a: 46,
		z: 20,
		abundance: 0.004,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000200480,
		displayName: 'Calcium-48',
		aliases: ['Ca-48', '48Ca', 'calcium-48'],
		a: 48,
		z: 20,
		abundance: 0.187,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000210450,
		displayName: 'Scandium-45',
		aliases: ['Sc-45', '45Sc', 'scandium-45'],
		a: 45,
		z: 21,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000220460,
		displayName: 'Titanium-46',
		aliases: ['Ti-46', '46Ti', 'titanium-46'],
		a: 46,
		z: 22,
		abundance: 8.25,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000220470,
		displayName: 'Titanium-47',
		aliases: ['Ti-47', '47Ti', 'titanium-47'],
		a: 47,
		z: 22,
		abundance: 7.44,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000220480,
		displayName: 'Titanium-48',
		aliases: ['Ti-48', '48Ti', 'titanium-48'],
		a: 48,
		z: 22,
		abundance: 73.72,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000220490,
		displayName: 'Titanium-49',
		aliases: ['Ti-49', '49Ti', 'titanium-49'],
		a: 49,
		z: 22,
		abundance: 5.41,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000220500,
		displayName: 'Titanium-50',
		aliases: ['Ti-50', '50Ti', 'titanium-50'],
		a: 50,
		z: 22,
		abundance: 5.18,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000230500,
		displayName: 'Vanadium-50',
		aliases: ['V-50', '50V', 'vanadium-50'],
		a: 50,
		z: 23,
		abundance: 0.25,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000230510,
		displayName: 'Vanadium-51',
		aliases: ['V-51', '51V', 'vanadium-51'],
		a: 51,
		z: 23,
		abundance: 99.75,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000240500,
		displayName: 'Chromium-50',
		aliases: ['Cr-50', '50Cr', 'chromium-50'],
		a: 50,
		z: 24,
		abundance: 4.345,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000240520,
		displayName: 'Chromium-52',
		aliases: ['Cr-52', '52Cr', 'chromium-52'],
		a: 52,
		z: 24,
		abundance: 83.789,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000240530,
		displayName: 'Chromium-53',
		aliases: ['Cr-53', '53Cr', 'chromium-53'],
		a: 53,
		z: 24,
		abundance: 9.501,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000240540,
		displayName: 'Chromium-54',
		aliases: ['Cr-54', '54Cr', 'chromium-54'],
		a: 54,
		z: 24,
		abundance: 2.365,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000250550,
		displayName: 'Manganese-55',
		aliases: ['Mn-55', '55Mn', 'manganese-55'],
		a: 55,
		z: 25,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000260540,
		displayName: 'Iron-54',
		aliases: ['Fe-54', '54Fe', 'iron-54'],
		a: 54,
		z: 26,
		abundance: 5.845,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000260560,
		displayName: 'Iron-56',
		aliases: ['Fe-56', '56Fe', 'iron-56'],
		a: 56,
		z: 26,
		abundance: 91.754,
		sortPriority: 2,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000260570,
		displayName: 'Iron-57',
		aliases: ['Fe-57', '57Fe', 'iron-57'],
		a: 57,
		z: 26,
		abundance: 2.119,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000260580,
		displayName: 'Iron-58',
		aliases: ['Fe-58', '58Fe', 'iron-58'],
		a: 58,
		z: 26,
		abundance: 0.282,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000270590,
		displayName: 'Cobalt-59',
		aliases: ['Co-59', '59Co', 'cobalt-59'],
		a: 59,
		z: 27,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000280580,
		displayName: 'Nickel-58',
		aliases: ['Ni-58', '58Ni', 'nickel-58'],
		a: 58,
		z: 28,
		abundance: 68.0769,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000280600,
		displayName: 'Nickel-60',
		aliases: ['Ni-60', '60Ni', 'nickel-60'],
		a: 60,
		z: 28,
		abundance: 26.2231,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000280610,
		displayName: 'Nickel-61',
		aliases: ['Ni-61', '61Ni', 'nickel-61'],
		a: 61,
		z: 28,
		abundance: 1.1399,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000280620,
		displayName: 'Nickel-62',
		aliases: ['Ni-62', '62Ni', 'nickel-62'],
		a: 62,
		z: 28,
		abundance: 3.6345,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000280640,
		displayName: 'Nickel-64',
		aliases: ['Ni-64', '64Ni', 'nickel-64'],
		a: 64,
		z: 28,
		abundance: 0.9256,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000290630,
		displayName: 'Copper-63',
		aliases: ['Cu-63', '63Cu', 'copper-63'],
		a: 63,
		z: 29,
		abundance: 69.15,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000290650,
		displayName: 'Copper-65',
		aliases: ['Cu-65', '65Cu', 'copper-65'],
		a: 65,
		z: 29,
		abundance: 30.85,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000300640,
		displayName: 'Zinc-64',
		aliases: ['Zn-64', '64Zn', 'zinc-64'],
		a: 64,
		z: 30,
		abundance: 49.17,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000300660,
		displayName: 'Zinc-66',
		aliases: ['Zn-66', '66Zn', 'zinc-66'],
		a: 66,
		z: 30,
		abundance: 27.73,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000300670,
		displayName: 'Zinc-67',
		aliases: ['Zn-67', '67Zn', 'zinc-67'],
		a: 67,
		z: 30,
		abundance: 4.04,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000300680,
		displayName: 'Zinc-68',
		aliases: ['Zn-68', '68Zn', 'zinc-68'],
		a: 68,
		z: 30,
		abundance: 18.45,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000300700,
		displayName: 'Zinc-70',
		aliases: ['Zn-70', '70Zn', 'zinc-70'],
		a: 70,
		z: 30,
		abundance: 0.61,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000310690,
		displayName: 'Gallium-69',
		aliases: ['Ga-69', '69Ga', 'gallium-69'],
		a: 69,
		z: 31,
		abundance: 60.108,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000310710,
		displayName: 'Gallium-71',
		aliases: ['Ga-71', '71Ga', 'gallium-71'],
		a: 71,
		z: 31,
		abundance: 39.892,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000320700,
		displayName: 'Germanium-70',
		aliases: ['Ge-70', '70Ge', 'germanium-70'],
		a: 70,
		z: 32,
		abundance: 20.52,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000320720,
		displayName: 'Germanium-72',
		aliases: ['Ge-72', '72Ge', 'germanium-72'],
		a: 72,
		z: 32,
		abundance: 27.45,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000320730,
		displayName: 'Germanium-73',
		aliases: ['Ge-73', '73Ge', 'germanium-73'],
		a: 73,
		z: 32,
		abundance: 7.76,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000320740,
		displayName: 'Germanium-74',
		aliases: ['Ge-74', '74Ge', 'germanium-74'],
		a: 74,
		z: 32,
		abundance: 36.52,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000320760,
		displayName: 'Germanium-76',
		aliases: ['Ge-76', '76Ge', 'germanium-76'],
		a: 76,
		z: 32,
		abundance: 7.75,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000330750,
		displayName: 'Arsenic-75',
		aliases: ['As-75', '75As', 'arsenic-75'],
		a: 75,
		z: 33,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000340740,
		displayName: 'Selenium-74',
		aliases: ['Se-74', '74Se', 'selenium-74'],
		a: 74,
		z: 34,
		abundance: 0.86,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000340760,
		displayName: 'Selenium-76',
		aliases: ['Se-76', '76Se', 'selenium-76'],
		a: 76,
		z: 34,
		abundance: 9.23,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000340770,
		displayName: 'Selenium-77',
		aliases: ['Se-77', '77Se', 'selenium-77'],
		a: 77,
		z: 34,
		abundance: 7.6,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000340780,
		displayName: 'Selenium-78',
		aliases: ['Se-78', '78Se', 'selenium-78'],
		a: 78,
		z: 34,
		abundance: 23.69,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000340800,
		displayName: 'Selenium-80',
		aliases: ['Se-80', '80Se', 'selenium-80'],
		a: 80,
		z: 34,
		abundance: 49.8,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000340820,
		displayName: 'Selenium-82',
		aliases: ['Se-82', '82Se', 'selenium-82'],
		a: 82,
		z: 34,
		abundance: 8.82,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000350790,
		displayName: 'Bromine-79',
		aliases: ['Br-79', '79Br', 'bromine-79'],
		a: 79,
		z: 35,
		abundance: 50.65,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000350810,
		displayName: 'Bromine-81',
		aliases: ['Br-81', '81Br', 'bromine-81'],
		a: 81,
		z: 35,
		abundance: 49.35,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000360780,
		displayName: 'Krypton-78',
		aliases: ['Kr-78', '78Kr', 'krypton-78'],
		a: 78,
		z: 36,
		abundance: 0.355,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000360800,
		displayName: 'Krypton-80',
		aliases: ['Kr-80', '80Kr', 'krypton-80'],
		a: 80,
		z: 36,
		abundance: 2.286,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000360820,
		displayName: 'Krypton-82',
		aliases: ['Kr-82', '82Kr', 'krypton-82'],
		a: 82,
		z: 36,
		abundance: 11.593,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000360830,
		displayName: 'Krypton-83',
		aliases: ['Kr-83', '83Kr', 'krypton-83'],
		a: 83,
		z: 36,
		abundance: 11.5,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000360840,
		displayName: 'Krypton-84',
		aliases: ['Kr-84', '84Kr', 'krypton-84'],
		a: 84,
		z: 36,
		abundance: 56.987,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000360860,
		displayName: 'Krypton-86',
		aliases: ['Kr-86', '86Kr', 'krypton-86'],
		a: 86,
		z: 36,
		abundance: 17.279,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000370850,
		displayName: 'Rubidium-85',
		aliases: ['Rb-85', '85Rb', 'rubidium-85'],
		a: 85,
		z: 37,
		abundance: 72.17,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000370870,
		displayName: 'Rubidium-87',
		aliases: ['Rb-87', '87Rb', 'rubidium-87'],
		a: 87,
		z: 37,
		abundance: 27.83,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000380840,
		displayName: 'Strontium-84',
		aliases: ['Sr-84', '84Sr', 'strontium-84'],
		a: 84,
		z: 38,
		abundance: 0.56,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000380860,
		displayName: 'Strontium-86',
		aliases: ['Sr-86', '86Sr', 'strontium-86'],
		a: 86,
		z: 38,
		abundance: 9.86,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000380870,
		displayName: 'Strontium-87',
		aliases: ['Sr-87', '87Sr', 'strontium-87'],
		a: 87,
		z: 38,
		abundance: 7.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000380880,
		displayName: 'Strontium-88',
		aliases: ['Sr-88', '88Sr', 'strontium-88'],
		a: 88,
		z: 38,
		abundance: 82.58,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000390890,
		displayName: 'Yttrium-89',
		aliases: ['Y-89', '89Y', 'yttrium-89'],
		a: 89,
		z: 39,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000400900,
		displayName: 'Zirconium-90',
		aliases: ['Zr-90', '90Zr', 'zirconium-90'],
		a: 90,
		z: 40,
		abundance: 51.45,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000400910,
		displayName: 'Zirconium-91',
		aliases: ['Zr-91', '91Zr', 'zirconium-91'],
		a: 91,
		z: 40,
		abundance: 11.22,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000400920,
		displayName: 'Zirconium-92',
		aliases: ['Zr-92', '92Zr', 'zirconium-92'],
		a: 92,
		z: 40,
		abundance: 17.15,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000400940,
		displayName: 'Zirconium-94',
		aliases: ['Zr-94', '94Zr', 'zirconium-94'],
		a: 94,
		z: 40,
		abundance: 17.38,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000400960,
		displayName: 'Zirconium-96',
		aliases: ['Zr-96', '96Zr', 'zirconium-96'],
		a: 96,
		z: 40,
		abundance: 2.8,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000410930,
		displayName: 'Niobium-93',
		aliases: ['Nb-93', '93Nb', 'niobium-93'],
		a: 93,
		z: 41,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000420920,
		displayName: 'Molybdenum-92',
		aliases: ['Mo-92', '92Mo', 'molybdenum-92'],
		a: 92,
		z: 42,
		abundance: 14.649,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000420940,
		displayName: 'Molybdenum-94',
		aliases: ['Mo-94', '94Mo', 'molybdenum-94'],
		a: 94,
		z: 42,
		abundance: 9.187,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000420950,
		displayName: 'Molybdenum-95',
		aliases: ['Mo-95', '95Mo', 'molybdenum-95'],
		a: 95,
		z: 42,
		abundance: 15.873,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000420960,
		displayName: 'Molybdenum-96',
		aliases: ['Mo-96', '96Mo', 'molybdenum-96'],
		a: 96,
		z: 42,
		abundance: 16.673,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000420970,
		displayName: 'Molybdenum-97',
		aliases: ['Mo-97', '97Mo', 'molybdenum-97'],
		a: 97,
		z: 42,
		abundance: 9.582,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000420980,
		displayName: 'Molybdenum-98',
		aliases: ['Mo-98', '98Mo', 'molybdenum-98'],
		a: 98,
		z: 42,
		abundance: 24.292,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000421000,
		displayName: 'Molybdenum-100',
		aliases: ['Mo-100', '100Mo', 'molybdenum-100'],
		a: 100,
		z: 42,
		abundance: 9.744,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000440960,
		displayName: 'Ruthenium-96',
		aliases: ['Ru-96', '96Ru', 'ruthenium-96'],
		a: 96,
		z: 44,
		abundance: 5.54,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000440980,
		displayName: 'Ruthenium-98',
		aliases: ['Ru-98', '98Ru', 'ruthenium-98'],
		a: 98,
		z: 44,
		abundance: 1.87,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000440990,
		displayName: 'Ruthenium-99',
		aliases: ['Ru-99', '99Ru', 'ruthenium-99'],
		a: 99,
		z: 44,
		abundance: 12.76,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000441000,
		displayName: 'Ruthenium-100',
		aliases: ['Ru-100', '100Ru', 'ruthenium-100'],
		a: 100,
		z: 44,
		abundance: 12.6,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000441010,
		displayName: 'Ruthenium-101',
		aliases: ['Ru-101', '101Ru', 'ruthenium-101'],
		a: 101,
		z: 44,
		abundance: 17.06,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000441020,
		displayName: 'Ruthenium-102',
		aliases: ['Ru-102', '102Ru', 'ruthenium-102'],
		a: 102,
		z: 44,
		abundance: 31.55,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000441040,
		displayName: 'Ruthenium-104',
		aliases: ['Ru-104', '104Ru', 'ruthenium-104'],
		a: 104,
		z: 44,
		abundance: 18.62,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000451030,
		displayName: 'Rhodium-103',
		aliases: ['Rh-103', '103Rh', 'rhodium-103'],
		a: 103,
		z: 45,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000461020,
		displayName: 'Palladium-102',
		aliases: ['Pd-102', '102Pd', 'palladium-102'],
		a: 102,
		z: 46,
		abundance: 1.02,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000461040,
		displayName: 'Palladium-104',
		aliases: ['Pd-104', '104Pd', 'palladium-104'],
		a: 104,
		z: 46,
		abundance: 11.14,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000461050,
		displayName: 'Palladium-105',
		aliases: ['Pd-105', '105Pd', 'palladium-105'],
		a: 105,
		z: 46,
		abundance: 22.33,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000461060,
		displayName: 'Palladium-106',
		aliases: ['Pd-106', '106Pd', 'palladium-106'],
		a: 106,
		z: 46,
		abundance: 27.33,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000461080,
		displayName: 'Palladium-108',
		aliases: ['Pd-108', '108Pd', 'palladium-108'],
		a: 108,
		z: 46,
		abundance: 26.46,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000461100,
		displayName: 'Palladium-110',
		aliases: ['Pd-110', '110Pd', 'palladium-110'],
		a: 110,
		z: 46,
		abundance: 11.72,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000471070,
		displayName: 'Silver-107',
		aliases: ['Ag-107', '107Ag', 'silver-107'],
		a: 107,
		z: 47,
		abundance: 51.839,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000471090,
		displayName: 'Silver-109',
		aliases: ['Ag-109', '109Ag', 'silver-109'],
		a: 109,
		z: 47,
		abundance: 48.161,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000481060,
		displayName: 'Cadmium-106',
		aliases: ['Cd-106', '106Cd', 'cadmium-106'],
		a: 106,
		z: 48,
		abundance: 1.245,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000481080,
		displayName: 'Cadmium-108',
		aliases: ['Cd-108', '108Cd', 'cadmium-108'],
		a: 108,
		z: 48,
		abundance: 0.888,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000481100,
		displayName: 'Cadmium-110',
		aliases: ['Cd-110', '110Cd', 'cadmium-110'],
		a: 110,
		z: 48,
		abundance: 12.47,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000481110,
		displayName: 'Cadmium-111',
		aliases: ['Cd-111', '111Cd', 'cadmium-111'],
		a: 111,
		z: 48,
		abundance: 12.795,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000481120,
		displayName: 'Cadmium-112',
		aliases: ['Cd-112', '112Cd', 'cadmium-112'],
		a: 112,
		z: 48,
		abundance: 24.109,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000481130,
		displayName: 'Cadmium-113',
		aliases: ['Cd-113', '113Cd', 'cadmium-113'],
		a: 113,
		z: 48,
		abundance: 12.227,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000481140,
		displayName: 'Cadmium-114',
		aliases: ['Cd-114', '114Cd', 'cadmium-114'],
		a: 114,
		z: 48,
		abundance: 28.754,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000481160,
		displayName: 'Cadmium-116',
		aliases: ['Cd-116', '116Cd', 'cadmium-116'],
		a: 116,
		z: 48,
		abundance: 7.512,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000491130,
		displayName: 'Indium-113',
		aliases: ['In-113', '113In', 'indium-113'],
		a: 113,
		z: 49,
		abundance: 4.281,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000491150,
		displayName: 'Indium-115',
		aliases: ['In-115', '115In', 'indium-115'],
		a: 115,
		z: 49,
		abundance: 95.719,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000501120,
		displayName: 'Tin-112',
		aliases: ['Sn-112', '112Sn', 'tin-112'],
		a: 112,
		z: 50,
		abundance: 0.97,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000501140,
		displayName: 'Tin-114',
		aliases: ['Sn-114', '114Sn', 'tin-114'],
		a: 114,
		z: 50,
		abundance: 0.66,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000501150,
		displayName: 'Tin-115',
		aliases: ['Sn-115', '115Sn', 'tin-115'],
		a: 115,
		z: 50,
		abundance: 0.34,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000501160,
		displayName: 'Tin-116',
		aliases: ['Sn-116', '116Sn', 'tin-116'],
		a: 116,
		z: 50,
		abundance: 14.54,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000501170,
		displayName: 'Tin-117',
		aliases: ['Sn-117', '117Sn', 'tin-117'],
		a: 117,
		z: 50,
		abundance: 7.68,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000501180,
		displayName: 'Tin-118',
		aliases: ['Sn-118', '118Sn', 'tin-118'],
		a: 118,
		z: 50,
		abundance: 24.22,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000501190,
		displayName: 'Tin-119',
		aliases: ['Sn-119', '119Sn', 'tin-119'],
		a: 119,
		z: 50,
		abundance: 8.59,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000501200,
		displayName: 'Tin-120',
		aliases: ['Sn-120', '120Sn', 'tin-120'],
		a: 120,
		z: 50,
		abundance: 32.58,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000501220,
		displayName: 'Tin-122',
		aliases: ['Sn-122', '122Sn', 'tin-122'],
		a: 122,
		z: 50,
		abundance: 4.63,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000501240,
		displayName: 'Tin-124',
		aliases: ['Sn-124', '124Sn', 'tin-124'],
		a: 124,
		z: 50,
		abundance: 5.79,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000511210,
		displayName: 'Antimony-121',
		aliases: ['Sb-121', '121Sb', 'antimony-121'],
		a: 121,
		z: 51,
		abundance: 57.21,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000511230,
		displayName: 'Antimony-123',
		aliases: ['Sb-123', '123Sb', 'antimony-123'],
		a: 123,
		z: 51,
		abundance: 42.79,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000521200,
		displayName: 'Tellurium-120',
		aliases: ['Te-120', '120Te', 'tellurium-120'],
		a: 120,
		z: 52,
		abundance: 0.09,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000521220,
		displayName: 'Tellurium-122',
		aliases: ['Te-122', '122Te', 'tellurium-122'],
		a: 122,
		z: 52,
		abundance: 2.55,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000521230,
		displayName: 'Tellurium-123',
		aliases: ['Te-123', '123Te', 'tellurium-123'],
		a: 123,
		z: 52,
		abundance: 0.89,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000521240,
		displayName: 'Tellurium-124',
		aliases: ['Te-124', '124Te', 'tellurium-124'],
		a: 124,
		z: 52,
		abundance: 4.74,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000521250,
		displayName: 'Tellurium-125',
		aliases: ['Te-125', '125Te', 'tellurium-125'],
		a: 125,
		z: 52,
		abundance: 7.07,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000521260,
		displayName: 'Tellurium-126',
		aliases: ['Te-126', '126Te', 'tellurium-126'],
		a: 126,
		z: 52,
		abundance: 18.84,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000521280,
		displayName: 'Tellurium-128',
		aliases: ['Te-128', '128Te', 'tellurium-128'],
		a: 128,
		z: 52,
		abundance: 31.74,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000521300,
		displayName: 'Tellurium-130',
		aliases: ['Te-130', '130Te', 'tellurium-130'],
		a: 130,
		z: 52,
		abundance: 34.08,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000531270,
		displayName: 'Iodine-127',
		aliases: ['I-127', '127I', 'iodine-127'],
		a: 127,
		z: 53,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000541240,
		displayName: 'Xenon-124',
		aliases: ['Xe-124', '124Xe', 'xenon-124'],
		a: 124,
		z: 54,
		abundance: 0.095,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000541260,
		displayName: 'Xenon-126',
		aliases: ['Xe-126', '126Xe', 'xenon-126'],
		a: 126,
		z: 54,
		abundance: 0.089,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000541280,
		displayName: 'Xenon-128',
		aliases: ['Xe-128', '128Xe', 'xenon-128'],
		a: 128,
		z: 54,
		abundance: 1.91,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000541290,
		displayName: 'Xenon-129',
		aliases: ['Xe-129', '129Xe', 'xenon-129'],
		a: 129,
		z: 54,
		abundance: 26.401,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000541300,
		displayName: 'Xenon-130',
		aliases: ['Xe-130', '130Xe', 'xenon-130'],
		a: 130,
		z: 54,
		abundance: 4.071,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000541310,
		displayName: 'Xenon-131',
		aliases: ['Xe-131', '131Xe', 'xenon-131'],
		a: 131,
		z: 54,
		abundance: 21.232,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000541320,
		displayName: 'Xenon-132',
		aliases: ['Xe-132', '132Xe', 'xenon-132'],
		a: 132,
		z: 54,
		abundance: 26.909,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000541340,
		displayName: 'Xenon-134',
		aliases: ['Xe-134', '134Xe', 'xenon-134'],
		a: 134,
		z: 54,
		abundance: 10.436,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000541360,
		displayName: 'Xenon-136',
		aliases: ['Xe-136', '136Xe', 'xenon-136'],
		a: 136,
		z: 54,
		abundance: 8.857,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000551330,
		displayName: 'Cesium-133',
		aliases: ['Cs-133', '133Cs', 'cesium-133'],
		a: 133,
		z: 55,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000561300,
		displayName: 'Barium-130',
		aliases: ['Ba-130', '130Ba', 'barium-130'],
		a: 130,
		z: 56,
		abundance: 0.11,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000561320,
		displayName: 'Barium-132',
		aliases: ['Ba-132', '132Ba', 'barium-132'],
		a: 132,
		z: 56,
		abundance: 0.1,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000561340,
		displayName: 'Barium-134',
		aliases: ['Ba-134', '134Ba', 'barium-134'],
		a: 134,
		z: 56,
		abundance: 2.42,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000561350,
		displayName: 'Barium-135',
		aliases: ['Ba-135', '135Ba', 'barium-135'],
		a: 135,
		z: 56,
		abundance: 6.59,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000561360,
		displayName: 'Barium-136',
		aliases: ['Ba-136', '136Ba', 'barium-136'],
		a: 136,
		z: 56,
		abundance: 7.85,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000561370,
		displayName: 'Barium-137',
		aliases: ['Ba-137', '137Ba', 'barium-137'],
		a: 137,
		z: 56,
		abundance: 11.23,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000561380,
		displayName: 'Barium-138',
		aliases: ['Ba-138', '138Ba', 'barium-138'],
		a: 138,
		z: 56,
		abundance: 71.7,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000571380,
		displayName: 'Lanthanum-138',
		aliases: ['La-138', '138La', 'lanthanum-138'],
		a: 138,
		z: 57,
		abundance: 0.08881,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000571390,
		displayName: 'Lanthanum-139',
		aliases: ['La-139', '139La', 'lanthanum-139'],
		a: 139,
		z: 57,
		abundance: 99.91119,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000581360,
		displayName: 'Cerium-136',
		aliases: ['Ce-136', '136Ce', 'cerium-136'],
		a: 136,
		z: 58,
		abundance: 0.186,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000581380,
		displayName: 'Cerium-138',
		aliases: ['Ce-138', '138Ce', 'cerium-138'],
		a: 138,
		z: 58,
		abundance: 0.251,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000581400,
		displayName: 'Cerium-140',
		aliases: ['Ce-140', '140Ce', 'cerium-140'],
		a: 140,
		z: 58,
		abundance: 88.449,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000581420,
		displayName: 'Cerium-142',
		aliases: ['Ce-142', '142Ce', 'cerium-142'],
		a: 142,
		z: 58,
		abundance: 11.114,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000591410,
		displayName: 'Praseodymium-141',
		aliases: ['Pr-141', '141Pr', 'praseodymium-141'],
		a: 141,
		z: 59,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000601420,
		displayName: 'Neodymium-142',
		aliases: ['Nd-142', '142Nd', 'neodymium-142'],
		a: 142,
		z: 60,
		abundance: 27.153,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000601430,
		displayName: 'Neodymium-143',
		aliases: ['Nd-143', '143Nd', 'neodymium-143'],
		a: 143,
		z: 60,
		abundance: 12.173,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000601440,
		displayName: 'Neodymium-144',
		aliases: ['Nd-144', '144Nd', 'neodymium-144'],
		a: 144,
		z: 60,
		abundance: 23.798,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000601450,
		displayName: 'Neodymium-145',
		aliases: ['Nd-145', '145Nd', 'neodymium-145'],
		a: 145,
		z: 60,
		abundance: 8.293,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000601460,
		displayName: 'Neodymium-146',
		aliases: ['Nd-146', '146Nd', 'neodymium-146'],
		a: 146,
		z: 60,
		abundance: 17.189,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000601480,
		displayName: 'Neodymium-148',
		aliases: ['Nd-148', '148Nd', 'neodymium-148'],
		a: 148,
		z: 60,
		abundance: 5.756,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000601500,
		displayName: 'Neodymium-150',
		aliases: ['Nd-150', '150Nd', 'neodymium-150'],
		a: 150,
		z: 60,
		abundance: 5.638,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000621440,
		displayName: 'Samarium-144',
		aliases: ['Sm-144', '144Sm', 'samarium-144'],
		a: 144,
		z: 62,
		abundance: 3.08,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000621470,
		displayName: 'Samarium-147',
		aliases: ['Sm-147', '147Sm', 'samarium-147'],
		a: 147,
		z: 62,
		abundance: 15.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000621480,
		displayName: 'Samarium-148',
		aliases: ['Sm-148', '148Sm', 'samarium-148'],
		a: 148,
		z: 62,
		abundance: 11.25,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000621490,
		displayName: 'Samarium-149',
		aliases: ['Sm-149', '149Sm', 'samarium-149'],
		a: 149,
		z: 62,
		abundance: 13.82,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000621500,
		displayName: 'Samarium-150',
		aliases: ['Sm-150', '150Sm', 'samarium-150'],
		a: 150,
		z: 62,
		abundance: 7.37,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000621520,
		displayName: 'Samarium-152',
		aliases: ['Sm-152', '152Sm', 'samarium-152'],
		a: 152,
		z: 62,
		abundance: 26.74,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000621540,
		displayName: 'Samarium-154',
		aliases: ['Sm-154', '154Sm', 'samarium-154'],
		a: 154,
		z: 62,
		abundance: 22.74,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000631510,
		displayName: 'Europium-151',
		aliases: ['Eu-151', '151Eu', 'europium-151'],
		a: 151,
		z: 63,
		abundance: 47.81,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000631530,
		displayName: 'Europium-153',
		aliases: ['Eu-153', '153Eu', 'europium-153'],
		a: 153,
		z: 63,
		abundance: 52.19,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000641520,
		displayName: 'Gadolinium-152',
		aliases: ['Gd-152', '152Gd', 'gadolinium-152'],
		a: 152,
		z: 64,
		abundance: 0.2,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000641540,
		displayName: 'Gadolinium-154',
		aliases: ['Gd-154', '154Gd', 'gadolinium-154'],
		a: 154,
		z: 64,
		abundance: 2.18,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000641550,
		displayName: 'Gadolinium-155',
		aliases: ['Gd-155', '155Gd', 'gadolinium-155'],
		a: 155,
		z: 64,
		abundance: 14.8,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000641560,
		displayName: 'Gadolinium-156',
		aliases: ['Gd-156', '156Gd', 'gadolinium-156'],
		a: 156,
		z: 64,
		abundance: 20.47,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000641570,
		displayName: 'Gadolinium-157',
		aliases: ['Gd-157', '157Gd', 'gadolinium-157'],
		a: 157,
		z: 64,
		abundance: 15.65,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000641580,
		displayName: 'Gadolinium-158',
		aliases: ['Gd-158', '158Gd', 'gadolinium-158'],
		a: 158,
		z: 64,
		abundance: 24.84,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000641600,
		displayName: 'Gadolinium-160',
		aliases: ['Gd-160', '160Gd', 'gadolinium-160'],
		a: 160,
		z: 64,
		abundance: 21.86,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000651590,
		displayName: 'Terbium-159',
		aliases: ['Tb-159', '159Tb', 'terbium-159'],
		a: 159,
		z: 65,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000661560,
		displayName: 'Dysprosium-156',
		aliases: ['Dy-156', '156Dy', 'dysprosium-156'],
		a: 156,
		z: 66,
		abundance: 0.056,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000661580,
		displayName: 'Dysprosium-158',
		aliases: ['Dy-158', '158Dy', 'dysprosium-158'],
		a: 158,
		z: 66,
		abundance: 0.095,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000661600,
		displayName: 'Dysprosium-160',
		aliases: ['Dy-160', '160Dy', 'dysprosium-160'],
		a: 160,
		z: 66,
		abundance: 2.329,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000661610,
		displayName: 'Dysprosium-161',
		aliases: ['Dy-161', '161Dy', 'dysprosium-161'],
		a: 161,
		z: 66,
		abundance: 18.889,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000661620,
		displayName: 'Dysprosium-162',
		aliases: ['Dy-162', '162Dy', 'dysprosium-162'],
		a: 162,
		z: 66,
		abundance: 25.475,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000661630,
		displayName: 'Dysprosium-163',
		aliases: ['Dy-163', '163Dy', 'dysprosium-163'],
		a: 163,
		z: 66,
		abundance: 24.896,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000661640,
		displayName: 'Dysprosium-164',
		aliases: ['Dy-164', '164Dy', 'dysprosium-164'],
		a: 164,
		z: 66,
		abundance: 28.26,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000671650,
		displayName: 'Holmium-165',
		aliases: ['Ho-165', '165Ho', 'holmium-165'],
		a: 165,
		z: 67,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000681620,
		displayName: 'Erbium-162',
		aliases: ['Er-162', '162Er', 'erbium-162'],
		a: 162,
		z: 68,
		abundance: 0.139,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000681640,
		displayName: 'Erbium-164',
		aliases: ['Er-164', '164Er', 'erbium-164'],
		a: 164,
		z: 68,
		abundance: 1.601,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000681660,
		displayName: 'Erbium-166',
		aliases: ['Er-166', '166Er', 'erbium-166'],
		a: 166,
		z: 68,
		abundance: 33.503,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000681670,
		displayName: 'Erbium-167',
		aliases: ['Er-167', '167Er', 'erbium-167'],
		a: 167,
		z: 68,
		abundance: 22.869,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000681680,
		displayName: 'Erbium-168',
		aliases: ['Er-168', '168Er', 'erbium-168'],
		a: 168,
		z: 68,
		abundance: 26.978,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000681700,
		displayName: 'Erbium-170',
		aliases: ['Er-170', '170Er', 'erbium-170'],
		a: 170,
		z: 68,
		abundance: 14.91,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000691690,
		displayName: 'Thulium-169',
		aliases: ['Tm-169', '169Tm', 'thulium-169'],
		a: 169,
		z: 69,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000701680,
		displayName: 'Ytterbium-168',
		aliases: ['Yb-168', '168Yb', 'ytterbium-168'],
		a: 168,
		z: 70,
		abundance: 0.123,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000701700,
		displayName: 'Ytterbium-170',
		aliases: ['Yb-170', '170Yb', 'ytterbium-170'],
		a: 170,
		z: 70,
		abundance: 2.982,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000701710,
		displayName: 'Ytterbium-171',
		aliases: ['Yb-171', '171Yb', 'ytterbium-171'],
		a: 171,
		z: 70,
		abundance: 14.086,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000701720,
		displayName: 'Ytterbium-172',
		aliases: ['Yb-172', '172Yb', 'ytterbium-172'],
		a: 172,
		z: 70,
		abundance: 21.686,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000701730,
		displayName: 'Ytterbium-173',
		aliases: ['Yb-173', '173Yb', 'ytterbium-173'],
		a: 173,
		z: 70,
		abundance: 16.103,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000701740,
		displayName: 'Ytterbium-174',
		aliases: ['Yb-174', '174Yb', 'ytterbium-174'],
		a: 174,
		z: 70,
		abundance: 32.025,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000701760,
		displayName: 'Ytterbium-176',
		aliases: ['Yb-176', '176Yb', 'ytterbium-176'],
		a: 176,
		z: 70,
		abundance: 12.995,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000711750,
		displayName: 'Lutetium-175',
		aliases: ['Lu-175', '175Lu', 'lutetium-175'],
		a: 175,
		z: 71,
		abundance: 97.401,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000711760,
		displayName: 'Lutetium-176',
		aliases: ['Lu-176', '176Lu', 'lutetium-176'],
		a: 176,
		z: 71,
		abundance: 2.599,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000721740,
		displayName: 'Hafnium-174',
		aliases: ['Hf-174', '174Hf', 'hafnium-174'],
		a: 174,
		z: 72,
		abundance: 0.16,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000721760,
		displayName: 'Hafnium-176',
		aliases: ['Hf-176', '176Hf', 'hafnium-176'],
		a: 176,
		z: 72,
		abundance: 5.26,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000721770,
		displayName: 'Hafnium-177',
		aliases: ['Hf-177', '177Hf', 'hafnium-177'],
		a: 177,
		z: 72,
		abundance: 18.6,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000721780,
		displayName: 'Hafnium-178',
		aliases: ['Hf-178', '178Hf', 'hafnium-178'],
		a: 178,
		z: 72,
		abundance: 27.28,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000721790,
		displayName: 'Hafnium-179',
		aliases: ['Hf-179', '179Hf', 'hafnium-179'],
		a: 179,
		z: 72,
		abundance: 13.62,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000721800,
		displayName: 'Hafnium-180',
		aliases: ['Hf-180', '180Hf', 'hafnium-180'],
		a: 180,
		z: 72,
		abundance: 35.08,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000731810,
		displayName: 'Tantalum-181',
		aliases: ['Ta-181', '181Ta', 'tantalum-181'],
		a: 181,
		z: 73,
		abundance: 99.98799,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000741800,
		displayName: 'Tungsten-180',
		aliases: ['W-180', '180W', 'tungsten-180'],
		a: 180,
		z: 74,
		abundance: 0.12,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000741820,
		displayName: 'Tungsten-182',
		aliases: ['W-182', '182W', 'tungsten-182'],
		a: 182,
		z: 74,
		abundance: 26.5,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000741830,
		displayName: 'Tungsten-183',
		aliases: ['W-183', '183W', 'tungsten-183'],
		a: 183,
		z: 74,
		abundance: 14.31,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000741840,
		displayName: 'Tungsten-184',
		aliases: ['W-184', '184W', 'tungsten-184'],
		a: 184,
		z: 74,
		abundance: 30.64,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000741860,
		displayName: 'Tungsten-186',
		aliases: ['W-186', '186W', 'tungsten-186'],
		a: 186,
		z: 74,
		abundance: 28.43,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000751850,
		displayName: 'Rhenium-185',
		aliases: ['Re-185', '185Re', 'rhenium-185'],
		a: 185,
		z: 75,
		abundance: 37.4,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000751870,
		displayName: 'Rhenium-187',
		aliases: ['Re-187', '187Re', 'rhenium-187'],
		a: 187,
		z: 75,
		abundance: 62.6,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000761840,
		displayName: 'Osmium-184',
		aliases: ['Os-184', '184Os', 'osmium-184'],
		a: 184,
		z: 76,
		abundance: 0.02,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000761860,
		displayName: 'Osmium-186',
		aliases: ['Os-186', '186Os', 'osmium-186'],
		a: 186,
		z: 76,
		abundance: 1.59,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000761870,
		displayName: 'Osmium-187',
		aliases: ['Os-187', '187Os', 'osmium-187'],
		a: 187,
		z: 76,
		abundance: 1.96,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000761880,
		displayName: 'Osmium-188',
		aliases: ['Os-188', '188Os', 'osmium-188'],
		a: 188,
		z: 76,
		abundance: 13.24,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000761890,
		displayName: 'Osmium-189',
		aliases: ['Os-189', '189Os', 'osmium-189'],
		a: 189,
		z: 76,
		abundance: 16.15,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000761900,
		displayName: 'Osmium-190',
		aliases: ['Os-190', '190Os', 'osmium-190'],
		a: 190,
		z: 76,
		abundance: 26.26,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000761920,
		displayName: 'Osmium-192',
		aliases: ['Os-192', '192Os', 'osmium-192'],
		a: 192,
		z: 76,
		abundance: 40.78,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000771910,
		displayName: 'Iridium-191',
		aliases: ['Ir-191', '191Ir', 'iridium-191'],
		a: 191,
		z: 77,
		abundance: 37.3,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000771930,
		displayName: 'Iridium-193',
		aliases: ['Ir-193', '193Ir', 'iridium-193'],
		a: 193,
		z: 77,
		abundance: 62.7,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000781900,
		displayName: 'Platinum-190',
		aliases: ['Pt-190', '190Pt', 'platinum-190'],
		a: 190,
		z: 78,
		abundance: 0.012,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000781920,
		displayName: 'Platinum-192',
		aliases: ['Pt-192', '192Pt', 'platinum-192'],
		a: 192,
		z: 78,
		abundance: 0.782,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000781940,
		displayName: 'Platinum-194',
		aliases: ['Pt-194', '194Pt', 'platinum-194'],
		a: 194,
		z: 78,
		abundance: 32.864,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000781950,
		displayName: 'Platinum-195',
		aliases: ['Pt-195', '195Pt', 'platinum-195'],
		a: 195,
		z: 78,
		abundance: 33.775,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000781960,
		displayName: 'Platinum-196',
		aliases: ['Pt-196', '196Pt', 'platinum-196'],
		a: 196,
		z: 78,
		abundance: 25.211,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000781980,
		displayName: 'Platinum-198',
		aliases: ['Pt-198', '198Pt', 'platinum-198'],
		a: 198,
		z: 78,
		abundance: 7.356,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000791970,
		displayName: 'Gold-197',
		aliases: ['Au-197', '197Au', 'gold-197'],
		a: 197,
		z: 79,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000801960,
		displayName: 'Mercury-196',
		aliases: ['Hg-196', '196Hg', 'mercury-196'],
		a: 196,
		z: 80,
		abundance: 0.15,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000801980,
		displayName: 'Mercury-198',
		aliases: ['Hg-198', '198Hg', 'mercury-198'],
		a: 198,
		z: 80,
		abundance: 10.04,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000801990,
		displayName: 'Mercury-199',
		aliases: ['Hg-199', '199Hg', 'mercury-199'],
		a: 199,
		z: 80,
		abundance: 16.94,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000802000,
		displayName: 'Mercury-200',
		aliases: ['Hg-200', '200Hg', 'mercury-200'],
		a: 200,
		z: 80,
		abundance: 23.14,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000802010,
		displayName: 'Mercury-201',
		aliases: ['Hg-201', '201Hg', 'mercury-201'],
		a: 201,
		z: 80,
		abundance: 13.17,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000802020,
		displayName: 'Mercury-202',
		aliases: ['Hg-202', '202Hg', 'mercury-202'],
		a: 202,
		z: 80,
		abundance: 29.74,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000802040,
		displayName: 'Mercury-204',
		aliases: ['Hg-204', '204Hg', 'mercury-204'],
		a: 204,
		z: 80,
		abundance: 6.82,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000812030,
		displayName: 'Thallium-203',
		aliases: ['Tl-203', '203Tl', 'thallium-203'],
		a: 203,
		z: 81,
		abundance: 29.515,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000812050,
		displayName: 'Thallium-205',
		aliases: ['Tl-205', '205Tl', 'thallium-205'],
		a: 205,
		z: 81,
		abundance: 70.485,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000822040,
		displayName: 'Lead-204',
		aliases: ['Pb-204', '204Pb', 'lead-204'],
		a: 204,
		z: 82,
		abundance: 1.4,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000822060,
		displayName: 'Lead-206',
		aliases: ['Pb-206', '206Pb', 'lead-206'],
		a: 206,
		z: 82,
		abundance: 24.1,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000822070,
		displayName: 'Lead-207',
		aliases: ['Pb-207', '207Pb', 'lead-207'],
		a: 207,
		z: 82,
		abundance: 22.1,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000822080,
		displayName: 'Lead-208',
		aliases: ['Pb-208', '208Pb', 'lead-208'],
		a: 208,
		z: 82,
		abundance: 52.4,
		sortPriority: 3,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000832090,
		displayName: 'Bismuth-209',
		aliases: ['Bi-209', '209Bi', 'bismuth-209'],
		a: 209,
		z: 83,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000902300,
		displayName: 'Thorium-230',
		aliases: ['Th-230', '230Th', 'thorium-230'],
		a: 230,
		z: 90,
		abundance: 0.02,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000902320,
		displayName: 'Thorium-232',
		aliases: ['Th-232', '232Th', 'thorium-232'],
		a: 232,
		z: 90,
		abundance: 99.98,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000912310,
		displayName: 'Protactinium-231',
		aliases: ['Pa-231', '231Pa', 'protactinium-231'],
		a: 231,
		z: 91,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000922340,
		displayName: 'Uranium-234',
		aliases: ['U-234', '234U', 'uranium-234'],
		a: 234,
		z: 92,
		abundance: 0.0054,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000922350,
		displayName: 'Uranium-235',
		aliases: ['U-235', '235U', 'uranium-235'],
		a: 235,
		z: 92,
		abundance: 0.7204,
		sortPriority: 3,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 1000922380,
		displayName: 'Uranium-238',
		aliases: ['U-238', '238U', 'uranium-238'],
		a: 238,
		z: 92,
		abundance: 99.2742,
		sortPriority: 3,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 2112,
		displayName: 'Neutron',
		aliases: ['n', 'neutron'],
		a: 1,
		z: 0,
		sortPriority: 1,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 2212,
		displayName: 'Proton',
		aliases: ['p', 'proton'],
		a: 1,
		z: 1,
		sortPriority: 0,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 111,
		displayName: 'Pion π-',
		aliases: ['π-', 'pion-'],
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 211,
		displayName: 'Pion π+',
		aliases: ['π+', 'pion+'],
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 2224,
		displayName: 'Anti-proton',
		aliases: ['pbar', 'antiproton'],
		a: 1,
		z: 1,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA]
	},
	{
		pdg: 321,
		displayName: 'Kaon κ-',
		aliases: ['K-', 'kaon-'],
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA]
	},
	{
		pdg: 322,
		displayName: 'Kaon κ+',
		aliases: ['K+', 'kaon+'],
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA]
	},
	{
		pdg: 310,
		displayName: 'Kaon κ0',
		aliases: ['K0', 'kaon0'],
		sortPriority: 1,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA]
	},
	{
		pdg: 311,
		displayName: 'Kaon κ~',
		aliases: ['K~', 'kaon~'],
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA]
	},
	{
		pdg: 13,
		displayName: 'Muon µ-',
		aliases: ['µ-', 'muon-'],
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 14,
		displayName: 'Muon µ+',
		aliases: ['µ+', 'muon+'],
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: 11,
		displayName: 'Electron',
		aliases: ['e-', 'electron'],
		sortPriority: 1,
		simulators: [SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdg: -11,
		displayName: 'Positron',
		aliases: ['e+', 'positron'],
		sortPriority: 1,
		simulators: [SimulatorType.GEANT4]
	},
	{
		pdg: 22,
		displayName: 'Photon',
		aliases: ['γ', 'photon', 'gamma'],
		sortPriority: 1,
		simulators: [SimulatorType.GEANT4]
	}
] as const satisfies readonly ParticleEntry[];

/**
 * Returns true if this particle has the highest natural abundance
 * among all catalogue entries sharing the same Z value.
 * Returns false for non-isotope particles (abundance === undefined).
 */
export function isMostAbundantIsotope(
	particle: ParticleEntry,
	catalogue: readonly ParticleEntry[]
): boolean {
	if (particle.abundance === undefined || particle.z === undefined) return false;
	const maxAbundance = Math.max(
		...catalogue
			.filter(p => p.z === particle.z && p.abundance !== undefined)
			.map(p => p.abundance!)
	);

	return particle.abundance === maxAbundance;
}

/** Return particles available for a given simulator, pre-sorted by sortPriority */
export function getParticlesForSimulator(sim: SimulatorType): readonly ParticleEntry[] {
	return PARTICLE_CATALOGUE.filter(p => p.simulators.includes(sim)).sort(compareParticles);
}

/** Lookup by (id, a, z) — used for deserialisation */
// export function findParticleByIdAZ(
//   id: number, a?: number, z?: number, sim?: SimulatorType
// ): ParticleEntry | undefined;

/** True if particle is an ion*/
export function isIon(p: ParticleEntry): boolean {
	return p.pdg > 1000000000;
}

/**
 * Filter particles by query string against aliases (case-insensitive substring).
 * Returns results sorted by: sortPriority ASC, then Z ASC, then abundance DESC.
 */
export function filterParticles(
	query: string,
	particles: readonly ParticleEntry[]
): ParticleEntry[] {
	const lowerQuery = query.toLowerCase();

	return particles
		.filter(p => p.aliases.some(alias => alias.toLowerCase().startsWith(lowerQuery)))
		.sort(compareParticles);
}

/**
 * Sort comparator for particle list.
 * Primary:  sortPriority ASC (lower = first)
 * Secondary: Z ASC (lighter elements first)
 * Tertiary:  abundance DESC (most abundant isotope first)
 */
export function compareParticles(a: ParticleEntry, b: ParticleEntry): number {
	if (a.sortPriority !== b.sortPriority) {
		return a.sortPriority - b.sortPriority;
	}

	if (a.z !== b.z) {
		return (a.z ?? 0) - (b.z ?? 0);
	}

	return (b.abundance ?? 0) - (a.abundance ?? 0);
}
