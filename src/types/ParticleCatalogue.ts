export interface ParticleEntry {
	/** Unique identifier for the particle, e.g. 2212 for proton, 1000060120 for Carbon-12, etc. */
	pdgId: number;

	/** Display name shown after selection, e.g. "Carbon-12", "Electron", "Proton" */
	displayName: string;

	/**
	 * All strings a user may type to find this entry.
	 * Matching is case-insensitive substring against every alias.
	 */
	aliases: readonly string[];

	/** SHIELD-HIT12A / backend particle id */
	id: number;

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
	sortPriority?: number;

	/**
	 * Which simulators support this particle.
	 * Used by getParticlesForSimulator() to filter the catalogue.
	 */
	simulators: readonly SimulatorType[];
}
export enum SimulatorType {
	SHIELDHIT = 'SHIELDHIT',
	FLUKA = 'FLUKA',
	GEANT4 = 'GEANT4'
}

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

export const PARTICLE_CATALOGUE = [
	// {pdgId: 1000010010, displayName: 'hydrogen-1', aliases: ['H-1', '1H', 'hydrogen-1'],  id: 25, a: 1, z: 1, abundance: 99.9855, sortPriority: 10, simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]},
	// {pdgId: 1000010020, displayName: 'hydrogen-2', aliases: ['H-2', '2H', 'hydrogen-2'],  id: 25, a: 2, z: 1, abundance: 0.0145, sortPriority: 10, simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]},
	// {pdgId: 1000020030, displayName: 'helium-3', aliases: ['He-3', '3He', 'helium-3'],  id: 25, a: 3, z: 2, abundance: 0.0002, sortPriority: 10, simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]},
	// {pdgId: 1000020040, displayName: 'helium-4', aliases: ['He-4', '4He', 'helium-4'],  id: 25, a: 4, z: 2, abundance: 99.9998, sortPriority: 10, simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]},
	{
		pdgId: 1000030060,
		displayName: 'lithium-6',
		aliases: ['Li-6', '6Li', 'lithium-6'],
		id: 25,
		a: 6,
		z: 3,
		abundance: 4.85,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000030070,
		displayName: 'lithium-7',
		aliases: ['Li-7', '7Li', 'lithium-7'],
		id: 25,
		a: 7,
		z: 3,
		abundance: 95.15,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000040090,
		displayName: 'beryllium-9',
		aliases: ['Be-9', '9Be', 'beryllium-9'],
		id: 25,
		a: 9,
		z: 4,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000050100,
		displayName: 'boron-10',
		aliases: ['B-10', '10B', 'boron-10'],
		id: 25,
		a: 10,
		z: 5,
		abundance: 19.65,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000050110,
		displayName: 'boron-11',
		aliases: ['B-11', '11B', 'boron-11'],
		id: 25,
		a: 11,
		z: 5,
		abundance: 80.35,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000060120,
		displayName: 'carbon-12',
		aliases: ['C-12', '12C', 'carbon-12'],
		id: 25,
		a: 12,
		z: 6,
		abundance: 98.94,
		sortPriority: 0,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000060130,
		displayName: 'carbon-13',
		aliases: ['C-13', '13C', 'carbon-13'],
		id: 25,
		a: 13,
		z: 6,
		abundance: 1.06,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000070140,
		displayName: 'nitrogen-14',
		aliases: ['N-14', '14N', 'nitrogen-14'],
		id: 25,
		a: 14,
		z: 7,
		abundance: 99.6205,
		sortPriority: 2,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000070150,
		displayName: 'nitrogen-15',
		aliases: ['N-15', '15N', 'nitrogen-15'],
		id: 25,
		a: 15,
		z: 7,
		abundance: 0.3795,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000080160,
		displayName: 'oxygen-16',
		aliases: ['O-16', '16O', 'oxygen-16'],
		id: 25,
		a: 16,
		z: 8,
		abundance: 99.757,
		sortPriority: 2,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000080170,
		displayName: 'oxygen-17',
		aliases: ['O-17', '17O', 'oxygen-17'],
		id: 25,
		a: 17,
		z: 8,
		abundance: 0.03835,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000080180,
		displayName: 'oxygen-18',
		aliases: ['O-18', '18O', 'oxygen-18'],
		id: 25,
		a: 18,
		z: 8,
		abundance: 0.2045,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000090190,
		displayName: 'fluorine-19',
		aliases: ['F-19', '19F', 'fluorine-19'],
		id: 25,
		a: 19,
		z: 9,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000100200,
		displayName: 'neon-20',
		aliases: ['Ne-20', '20Ne', 'neon-20'],
		id: 25,
		a: 20,
		z: 10,
		abundance: 90.48,
		sortPriority: 2,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000100210,
		displayName: 'neon-21',
		aliases: ['Ne-21', '21Ne', 'neon-21'],
		id: 25,
		a: 21,
		z: 10,
		abundance: 0.27,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000100220,
		displayName: 'neon-22',
		aliases: ['Ne-22', '22Ne', 'neon-22'],
		id: 25,
		a: 22,
		z: 10,
		abundance: 9.25,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000110230,
		displayName: 'sodium-23',
		aliases: ['Na-23', '23Na', 'sodium-23'],
		id: 25,
		a: 23,
		z: 11,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000120240,
		displayName: 'magnesium-24',
		aliases: ['Mg-24', '24Mg', 'magnesium-24'],
		id: 25,
		a: 24,
		z: 12,
		abundance: 78.965,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000120250,
		displayName: 'magnesium-25',
		aliases: ['Mg-25', '25Mg', 'magnesium-25'],
		id: 25,
		a: 25,
		z: 12,
		abundance: 10.011,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000120260,
		displayName: 'magnesium-26',
		aliases: ['Mg-26', '26Mg', 'magnesium-26'],
		id: 25,
		a: 26,
		z: 12,
		abundance: 11.025,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000130270,
		displayName: 'aluminum-27',
		aliases: ['Al-27', '27Al', 'aluminum-27'],
		id: 25,
		a: 27,
		z: 13,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000140280,
		displayName: 'silicon-28',
		aliases: ['Si-28', '28Si', 'silicon-28'],
		id: 25,
		a: 28,
		z: 14,
		abundance: 92.2545,
		sortPriority: 3,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000140290,
		displayName: 'silicon-29',
		aliases: ['Si-29', '29Si', 'silicon-29'],
		id: 25,
		a: 29,
		z: 14,
		abundance: 4.672,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000140300,
		displayName: 'silicon-30',
		aliases: ['Si-30', '30Si', 'silicon-30'],
		id: 25,
		a: 30,
		z: 14,
		abundance: 3.0735,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000150310,
		displayName: 'phosphorus-31',
		aliases: ['P-31', '31P', 'phosphorus-31'],
		id: 25,
		a: 31,
		z: 15,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000160320,
		displayName: 'sulfur-32',
		aliases: ['S-32', '32S', 'sulfur-32'],
		id: 25,
		a: 32,
		z: 16,
		abundance: 94.85,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000160330,
		displayName: 'sulfur-33',
		aliases: ['S-33', '33S', 'sulfur-33'],
		id: 25,
		a: 33,
		z: 16,
		abundance: 0.763,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000160340,
		displayName: 'sulfur-34',
		aliases: ['S-34', '34S', 'sulfur-34'],
		id: 25,
		a: 34,
		z: 16,
		abundance: 4.365,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000160360,
		displayName: 'sulfur-36',
		aliases: ['S-36', '36S', 'sulfur-36'],
		id: 25,
		a: 36,
		z: 16,
		abundance: 0.0158,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000170350,
		displayName: 'chlorine-35',
		aliases: ['Cl-35', '35Cl', 'chlorine-35'],
		id: 25,
		a: 35,
		z: 17,
		abundance: 75.8,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000170370,
		displayName: 'chlorine-37',
		aliases: ['Cl-37', '37Cl', 'chlorine-37'],
		id: 25,
		a: 37,
		z: 17,
		abundance: 24.2,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000180360,
		displayName: 'argon-36',
		aliases: ['Ar-36', '36Ar', 'argon-36'],
		id: 25,
		a: 36,
		z: 18,
		abundance: 0.3336,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000180380,
		displayName: 'argon-38',
		aliases: ['Ar-38', '38Ar', 'argon-38'],
		id: 25,
		a: 38,
		z: 18,
		abundance: 0.0629,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000180400,
		displayName: 'argon-40',
		aliases: ['Ar-40', '40Ar', 'argon-40'],
		id: 25,
		a: 40,
		z: 18,
		abundance: 99.6035,
		sortPriority: 2,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000190390,
		displayName: 'potassium-39',
		aliases: ['K-39', '39K', 'potassium-39'],
		id: 25,
		a: 39,
		z: 19,
		abundance: 93.2581,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000190400,
		displayName: 'potassium-40',
		aliases: ['K-40', '40K', 'potassium-40'],
		id: 25,
		a: 40,
		z: 19,
		abundance: 0.0117,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000190410,
		displayName: 'potassium-41',
		aliases: ['K-41', '41K', 'potassium-41'],
		id: 25,
		a: 41,
		z: 19,
		abundance: 6.7302,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000200400,
		displayName: 'calcium-40',
		aliases: ['Ca-40', '40Ca', 'calcium-40'],
		id: 25,
		a: 40,
		z: 20,
		abundance: 96.941,
		sortPriority: 3,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000200420,
		displayName: 'calcium-42',
		aliases: ['Ca-42', '42Ca', 'calcium-42'],
		id: 25,
		a: 42,
		z: 20,
		abundance: 0.647,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000200430,
		displayName: 'calcium-43',
		aliases: ['Ca-43', '43Ca', 'calcium-43'],
		id: 25,
		a: 43,
		z: 20,
		abundance: 0.135,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000200440,
		displayName: 'calcium-44',
		aliases: ['Ca-44', '44Ca', 'calcium-44'],
		id: 25,
		a: 44,
		z: 20,
		abundance: 2.086,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000200460,
		displayName: 'calcium-46',
		aliases: ['Ca-46', '46Ca', 'calcium-46'],
		id: 25,
		a: 46,
		z: 20,
		abundance: 0.004,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000200480,
		displayName: 'calcium-48',
		aliases: ['Ca-48', '48Ca', 'calcium-48'],
		id: 25,
		a: 48,
		z: 20,
		abundance: 0.187,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000210450,
		displayName: 'scandium-45',
		aliases: ['Sc-45', '45Sc', 'scandium-45'],
		id: 25,
		a: 45,
		z: 21,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000220460,
		displayName: 'titanium-46',
		aliases: ['Ti-46', '46Ti', 'titanium-46'],
		id: 25,
		a: 46,
		z: 22,
		abundance: 8.25,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000220470,
		displayName: 'titanium-47',
		aliases: ['Ti-47', '47Ti', 'titanium-47'],
		id: 25,
		a: 47,
		z: 22,
		abundance: 7.44,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000220480,
		displayName: 'titanium-48',
		aliases: ['Ti-48', '48Ti', 'titanium-48'],
		id: 25,
		a: 48,
		z: 22,
		abundance: 73.72,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000220490,
		displayName: 'titanium-49',
		aliases: ['Ti-49', '49Ti', 'titanium-49'],
		id: 25,
		a: 49,
		z: 22,
		abundance: 5.41,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000220500,
		displayName: 'titanium-50',
		aliases: ['Ti-50', '50Ti', 'titanium-50'],
		id: 25,
		a: 50,
		z: 22,
		abundance: 5.18,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000230500,
		displayName: 'vanadium-50',
		aliases: ['V-50', '50V', 'vanadium-50'],
		id: 25,
		a: 50,
		z: 23,
		abundance: 0.25,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000230510,
		displayName: 'vanadium-51',
		aliases: ['V-51', '51V', 'vanadium-51'],
		id: 25,
		a: 51,
		z: 23,
		abundance: 99.75,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000240500,
		displayName: 'chromium-50',
		aliases: ['Cr-50', '50Cr', 'chromium-50'],
		id: 25,
		a: 50,
		z: 24,
		abundance: 4.345,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000240520,
		displayName: 'chromium-52',
		aliases: ['Cr-52', '52Cr', 'chromium-52'],
		id: 25,
		a: 52,
		z: 24,
		abundance: 83.789,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000240530,
		displayName: 'chromium-53',
		aliases: ['Cr-53', '53Cr', 'chromium-53'],
		id: 25,
		a: 53,
		z: 24,
		abundance: 9.501,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000240540,
		displayName: 'chromium-54',
		aliases: ['Cr-54', '54Cr', 'chromium-54'],
		id: 25,
		a: 54,
		z: 24,
		abundance: 2.365,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000250550,
		displayName: 'manganese-55',
		aliases: ['Mn-55', '55Mn', 'manganese-55'],
		id: 25,
		a: 55,
		z: 25,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000260540,
		displayName: 'iron-54',
		aliases: ['Fe-54', '54Fe', 'iron-54'],
		id: 25,
		a: 54,
		z: 26,
		abundance: 5.845,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000260560,
		displayName: 'iron-56',
		aliases: ['Fe-56', '56Fe', 'iron-56'],
		id: 25,
		a: 56,
		z: 26,
		abundance: 91.754,
		sortPriority: 2,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000260570,
		displayName: 'iron-57',
		aliases: ['Fe-57', '57Fe', 'iron-57'],
		id: 25,
		a: 57,
		z: 26,
		abundance: 2.119,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000260580,
		displayName: 'iron-58',
		aliases: ['Fe-58', '58Fe', 'iron-58'],
		id: 25,
		a: 58,
		z: 26,
		abundance: 0.282,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000270590,
		displayName: 'cobalt-59',
		aliases: ['Co-59', '59Co', 'cobalt-59'],
		id: 25,
		a: 59,
		z: 27,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000280580,
		displayName: 'nickel-58',
		aliases: ['Ni-58', '58Ni', 'nickel-58'],
		id: 25,
		a: 58,
		z: 28,
		abundance: 68.0769,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000280600,
		displayName: 'nickel-60',
		aliases: ['Ni-60', '60Ni', 'nickel-60'],
		id: 25,
		a: 60,
		z: 28,
		abundance: 26.2231,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000280610,
		displayName: 'nickel-61',
		aliases: ['Ni-61', '61Ni', 'nickel-61'],
		id: 25,
		a: 61,
		z: 28,
		abundance: 1.1399,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000280620,
		displayName: 'nickel-62',
		aliases: ['Ni-62', '62Ni', 'nickel-62'],
		id: 25,
		a: 62,
		z: 28,
		abundance: 3.6345,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000280640,
		displayName: 'nickel-64',
		aliases: ['Ni-64', '64Ni', 'nickel-64'],
		id: 25,
		a: 64,
		z: 28,
		abundance: 0.9256,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000290630,
		displayName: 'copper-63',
		aliases: ['Cu-63', '63Cu', 'copper-63'],
		id: 25,
		a: 63,
		z: 29,
		abundance: 69.15,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000290650,
		displayName: 'copper-65',
		aliases: ['Cu-65', '65Cu', 'copper-65'],
		id: 25,
		a: 65,
		z: 29,
		abundance: 30.85,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000300640,
		displayName: 'zinc-64',
		aliases: ['Zn-64', '64Zn', 'zinc-64'],
		id: 25,
		a: 64,
		z: 30,
		abundance: 49.17,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000300660,
		displayName: 'zinc-66',
		aliases: ['Zn-66', '66Zn', 'zinc-66'],
		id: 25,
		a: 66,
		z: 30,
		abundance: 27.73,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000300670,
		displayName: 'zinc-67',
		aliases: ['Zn-67', '67Zn', 'zinc-67'],
		id: 25,
		a: 67,
		z: 30,
		abundance: 4.04,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000300680,
		displayName: 'zinc-68',
		aliases: ['Zn-68', '68Zn', 'zinc-68'],
		id: 25,
		a: 68,
		z: 30,
		abundance: 18.45,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000300700,
		displayName: 'zinc-70',
		aliases: ['Zn-70', '70Zn', 'zinc-70'],
		id: 25,
		a: 70,
		z: 30,
		abundance: 0.61,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000310690,
		displayName: 'gallium-69',
		aliases: ['Ga-69', '69Ga', 'gallium-69'],
		id: 25,
		a: 69,
		z: 31,
		abundance: 60.108,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000310710,
		displayName: 'gallium-71',
		aliases: ['Ga-71', '71Ga', 'gallium-71'],
		id: 25,
		a: 71,
		z: 31,
		abundance: 39.892,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000320700,
		displayName: 'germanium-70',
		aliases: ['Ge-70', '70Ge', 'germanium-70'],
		id: 25,
		a: 70,
		z: 32,
		abundance: 20.52,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000320720,
		displayName: 'germanium-72',
		aliases: ['Ge-72', '72Ge', 'germanium-72'],
		id: 25,
		a: 72,
		z: 32,
		abundance: 27.45,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000320730,
		displayName: 'germanium-73',
		aliases: ['Ge-73', '73Ge', 'germanium-73'],
		id: 25,
		a: 73,
		z: 32,
		abundance: 7.76,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000320740,
		displayName: 'germanium-74',
		aliases: ['Ge-74', '74Ge', 'germanium-74'],
		id: 25,
		a: 74,
		z: 32,
		abundance: 36.52,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000320760,
		displayName: 'germanium-76',
		aliases: ['Ge-76', '76Ge', 'germanium-76'],
		id: 25,
		a: 76,
		z: 32,
		abundance: 7.75,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000330750,
		displayName: 'arsenic-75',
		aliases: ['As-75', '75As', 'arsenic-75'],
		id: 25,
		a: 75,
		z: 33,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000340740,
		displayName: 'selenium-74',
		aliases: ['Se-74', '74Se', 'selenium-74'],
		id: 25,
		a: 74,
		z: 34,
		abundance: 0.86,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000340760,
		displayName: 'selenium-76',
		aliases: ['Se-76', '76Se', 'selenium-76'],
		id: 25,
		a: 76,
		z: 34,
		abundance: 9.23,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000340770,
		displayName: 'selenium-77',
		aliases: ['Se-77', '77Se', 'selenium-77'],
		id: 25,
		a: 77,
		z: 34,
		abundance: 7.6,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000340780,
		displayName: 'selenium-78',
		aliases: ['Se-78', '78Se', 'selenium-78'],
		id: 25,
		a: 78,
		z: 34,
		abundance: 23.69,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000340800,
		displayName: 'selenium-80',
		aliases: ['Se-80', '80Se', 'selenium-80'],
		id: 25,
		a: 80,
		z: 34,
		abundance: 49.8,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000340820,
		displayName: 'selenium-82',
		aliases: ['Se-82', '82Se', 'selenium-82'],
		id: 25,
		a: 82,
		z: 34,
		abundance: 8.82,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000350790,
		displayName: 'bromine-79',
		aliases: ['Br-79', '79Br', 'bromine-79'],
		id: 25,
		a: 79,
		z: 35,
		abundance: 50.65,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000350810,
		displayName: 'bromine-81',
		aliases: ['Br-81', '81Br', 'bromine-81'],
		id: 25,
		a: 81,
		z: 35,
		abundance: 49.35,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000360780,
		displayName: 'krypton-78',
		aliases: ['Kr-78', '78Kr', 'krypton-78'],
		id: 25,
		a: 78,
		z: 36,
		abundance: 0.355,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000360800,
		displayName: 'krypton-80',
		aliases: ['Kr-80', '80Kr', 'krypton-80'],
		id: 25,
		a: 80,
		z: 36,
		abundance: 2.286,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000360820,
		displayName: 'krypton-82',
		aliases: ['Kr-82', '82Kr', 'krypton-82'],
		id: 25,
		a: 82,
		z: 36,
		abundance: 11.593,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000360830,
		displayName: 'krypton-83',
		aliases: ['Kr-83', '83Kr', 'krypton-83'],
		id: 25,
		a: 83,
		z: 36,
		abundance: 11.5,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000360840,
		displayName: 'krypton-84',
		aliases: ['Kr-84', '84Kr', 'krypton-84'],
		id: 25,
		a: 84,
		z: 36,
		abundance: 56.987,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000360860,
		displayName: 'krypton-86',
		aliases: ['Kr-86', '86Kr', 'krypton-86'],
		id: 25,
		a: 86,
		z: 36,
		abundance: 17.279,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000370850,
		displayName: 'rubidium-85',
		aliases: ['Rb-85', '85Rb', 'rubidium-85'],
		id: 25,
		a: 85,
		z: 37,
		abundance: 72.17,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000370870,
		displayName: 'rubidium-87',
		aliases: ['Rb-87', '87Rb', 'rubidium-87'],
		id: 25,
		a: 87,
		z: 37,
		abundance: 27.83,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000380840,
		displayName: 'strontium-84',
		aliases: ['Sr-84', '84Sr', 'strontium-84'],
		id: 25,
		a: 84,
		z: 38,
		abundance: 0.56,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000380860,
		displayName: 'strontium-86',
		aliases: ['Sr-86', '86Sr', 'strontium-86'],
		id: 25,
		a: 86,
		z: 38,
		abundance: 9.86,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000380870,
		displayName: 'strontium-87',
		aliases: ['Sr-87', '87Sr', 'strontium-87'],
		id: 25,
		a: 87,
		z: 38,
		abundance: 7.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000380880,
		displayName: 'strontium-88',
		aliases: ['Sr-88', '88Sr', 'strontium-88'],
		id: 25,
		a: 88,
		z: 38,
		abundance: 82.58,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000390890,
		displayName: 'yttrium-89',
		aliases: ['Y-89', '89Y', 'yttrium-89'],
		id: 25,
		a: 89,
		z: 39,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000400900,
		displayName: 'zirconium-90',
		aliases: ['Zr-90', '90Zr', 'zirconium-90'],
		id: 25,
		a: 90,
		z: 40,
		abundance: 51.45,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000400910,
		displayName: 'zirconium-91',
		aliases: ['Zr-91', '91Zr', 'zirconium-91'],
		id: 25,
		a: 91,
		z: 40,
		abundance: 11.22,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000400920,
		displayName: 'zirconium-92',
		aliases: ['Zr-92', '92Zr', 'zirconium-92'],
		id: 25,
		a: 92,
		z: 40,
		abundance: 17.15,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000400940,
		displayName: 'zirconium-94',
		aliases: ['Zr-94', '94Zr', 'zirconium-94'],
		id: 25,
		a: 94,
		z: 40,
		abundance: 17.38,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000400960,
		displayName: 'zirconium-96',
		aliases: ['Zr-96', '96Zr', 'zirconium-96'],
		id: 25,
		a: 96,
		z: 40,
		abundance: 2.8,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000410930,
		displayName: 'niobium-93',
		aliases: ['Nb-93', '93Nb', 'niobium-93'],
		id: 25,
		a: 93,
		z: 41,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000420920,
		displayName: 'molybdenum-92',
		aliases: ['Mo-92', '92Mo', 'molybdenum-92'],
		id: 25,
		a: 92,
		z: 42,
		abundance: 14.649,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000420940,
		displayName: 'molybdenum-94',
		aliases: ['Mo-94', '94Mo', 'molybdenum-94'],
		id: 25,
		a: 94,
		z: 42,
		abundance: 9.187,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000420950,
		displayName: 'molybdenum-95',
		aliases: ['Mo-95', '95Mo', 'molybdenum-95'],
		id: 25,
		a: 95,
		z: 42,
		abundance: 15.873,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000420960,
		displayName: 'molybdenum-96',
		aliases: ['Mo-96', '96Mo', 'molybdenum-96'],
		id: 25,
		a: 96,
		z: 42,
		abundance: 16.673,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000420970,
		displayName: 'molybdenum-97',
		aliases: ['Mo-97', '97Mo', 'molybdenum-97'],
		id: 25,
		a: 97,
		z: 42,
		abundance: 9.582,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000420980,
		displayName: 'molybdenum-98',
		aliases: ['Mo-98', '98Mo', 'molybdenum-98'],
		id: 25,
		a: 98,
		z: 42,
		abundance: 24.292,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000421000,
		displayName: 'molybdenum-100',
		aliases: ['Mo-100', '100Mo', 'molybdenum-100'],
		id: 25,
		a: 100,
		z: 42,
		abundance: 9.744,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000440960,
		displayName: 'ruthenium-96',
		aliases: ['Ru-96', '96Ru', 'ruthenium-96'],
		id: 25,
		a: 96,
		z: 44,
		abundance: 5.54,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000440980,
		displayName: 'ruthenium-98',
		aliases: ['Ru-98', '98Ru', 'ruthenium-98'],
		id: 25,
		a: 98,
		z: 44,
		abundance: 1.87,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000440990,
		displayName: 'ruthenium-99',
		aliases: ['Ru-99', '99Ru', 'ruthenium-99'],
		id: 25,
		a: 99,
		z: 44,
		abundance: 12.76,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000441000,
		displayName: 'ruthenium-100',
		aliases: ['Ru-100', '100Ru', 'ruthenium-100'],
		id: 25,
		a: 100,
		z: 44,
		abundance: 12.6,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000441010,
		displayName: 'ruthenium-101',
		aliases: ['Ru-101', '101Ru', 'ruthenium-101'],
		id: 25,
		a: 101,
		z: 44,
		abundance: 17.06,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000441020,
		displayName: 'ruthenium-102',
		aliases: ['Ru-102', '102Ru', 'ruthenium-102'],
		id: 25,
		a: 102,
		z: 44,
		abundance: 31.55,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000441040,
		displayName: 'ruthenium-104',
		aliases: ['Ru-104', '104Ru', 'ruthenium-104'],
		id: 25,
		a: 104,
		z: 44,
		abundance: 18.62,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000451030,
		displayName: 'rhodium-103',
		aliases: ['Rh-103', '103Rh', 'rhodium-103'],
		id: 25,
		a: 103,
		z: 45,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000461020,
		displayName: 'palladium-102',
		aliases: ['Pd-102', '102Pd', 'palladium-102'],
		id: 25,
		a: 102,
		z: 46,
		abundance: 1.02,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000461040,
		displayName: 'palladium-104',
		aliases: ['Pd-104', '104Pd', 'palladium-104'],
		id: 25,
		a: 104,
		z: 46,
		abundance: 11.14,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000461050,
		displayName: 'palladium-105',
		aliases: ['Pd-105', '105Pd', 'palladium-105'],
		id: 25,
		a: 105,
		z: 46,
		abundance: 22.33,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000461060,
		displayName: 'palladium-106',
		aliases: ['Pd-106', '106Pd', 'palladium-106'],
		id: 25,
		a: 106,
		z: 46,
		abundance: 27.33,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000461080,
		displayName: 'palladium-108',
		aliases: ['Pd-108', '108Pd', 'palladium-108'],
		id: 25,
		a: 108,
		z: 46,
		abundance: 26.46,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000461100,
		displayName: 'palladium-110',
		aliases: ['Pd-110', '110Pd', 'palladium-110'],
		id: 25,
		a: 110,
		z: 46,
		abundance: 11.72,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000471070,
		displayName: 'silver-107',
		aliases: ['Ag-107', '107Ag', 'silver-107'],
		id: 25,
		a: 107,
		z: 47,
		abundance: 51.839,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000471090,
		displayName: 'silver-109',
		aliases: ['Ag-109', '109Ag', 'silver-109'],
		id: 25,
		a: 109,
		z: 47,
		abundance: 48.161,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000481060,
		displayName: 'cadmium-106',
		aliases: ['Cd-106', '106Cd', 'cadmium-106'],
		id: 25,
		a: 106,
		z: 48,
		abundance: 1.245,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000481080,
		displayName: 'cadmium-108',
		aliases: ['Cd-108', '108Cd', 'cadmium-108'],
		id: 25,
		a: 108,
		z: 48,
		abundance: 0.888,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000481100,
		displayName: 'cadmium-110',
		aliases: ['Cd-110', '110Cd', 'cadmium-110'],
		id: 25,
		a: 110,
		z: 48,
		abundance: 12.47,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000481110,
		displayName: 'cadmium-111',
		aliases: ['Cd-111', '111Cd', 'cadmium-111'],
		id: 25,
		a: 111,
		z: 48,
		abundance: 12.795,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000481120,
		displayName: 'cadmium-112',
		aliases: ['Cd-112', '112Cd', 'cadmium-112'],
		id: 25,
		a: 112,
		z: 48,
		abundance: 24.109,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000481130,
		displayName: 'cadmium-113',
		aliases: ['Cd-113', '113Cd', 'cadmium-113'],
		id: 25,
		a: 113,
		z: 48,
		abundance: 12.227,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000481140,
		displayName: 'cadmium-114',
		aliases: ['Cd-114', '114Cd', 'cadmium-114'],
		id: 25,
		a: 114,
		z: 48,
		abundance: 28.754,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000481160,
		displayName: 'cadmium-116',
		aliases: ['Cd-116', '116Cd', 'cadmium-116'],
		id: 25,
		a: 116,
		z: 48,
		abundance: 7.512,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000491130,
		displayName: 'indium-113',
		aliases: ['In-113', '113In', 'indium-113'],
		id: 25,
		a: 113,
		z: 49,
		abundance: 4.281,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000491150,
		displayName: 'indium-115',
		aliases: ['In-115', '115In', 'indium-115'],
		id: 25,
		a: 115,
		z: 49,
		abundance: 95.719,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000501120,
		displayName: 'tin-112',
		aliases: ['Sn-112', '112Sn', 'tin-112'],
		id: 25,
		a: 112,
		z: 50,
		abundance: 0.97,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000501140,
		displayName: 'tin-114',
		aliases: ['Sn-114', '114Sn', 'tin-114'],
		id: 25,
		a: 114,
		z: 50,
		abundance: 0.66,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000501150,
		displayName: 'tin-115',
		aliases: ['Sn-115', '115Sn', 'tin-115'],
		id: 25,
		a: 115,
		z: 50,
		abundance: 0.34,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000501160,
		displayName: 'tin-116',
		aliases: ['Sn-116', '116Sn', 'tin-116'],
		id: 25,
		a: 116,
		z: 50,
		abundance: 14.54,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000501170,
		displayName: 'tin-117',
		aliases: ['Sn-117', '117Sn', 'tin-117'],
		id: 25,
		a: 117,
		z: 50,
		abundance: 7.68,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000501180,
		displayName: 'tin-118',
		aliases: ['Sn-118', '118Sn', 'tin-118'],
		id: 25,
		a: 118,
		z: 50,
		abundance: 24.22,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000501190,
		displayName: 'tin-119',
		aliases: ['Sn-119', '119Sn', 'tin-119'],
		id: 25,
		a: 119,
		z: 50,
		abundance: 8.59,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000501200,
		displayName: 'tin-120',
		aliases: ['Sn-120', '120Sn', 'tin-120'],
		id: 25,
		a: 120,
		z: 50,
		abundance: 32.58,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000501220,
		displayName: 'tin-122',
		aliases: ['Sn-122', '122Sn', 'tin-122'],
		id: 25,
		a: 122,
		z: 50,
		abundance: 4.63,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000501240,
		displayName: 'tin-124',
		aliases: ['Sn-124', '124Sn', 'tin-124'],
		id: 25,
		a: 124,
		z: 50,
		abundance: 5.79,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000511210,
		displayName: 'antimony-121',
		aliases: ['Sb-121', '121Sb', 'antimony-121'],
		id: 25,
		a: 121,
		z: 51,
		abundance: 57.21,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000511230,
		displayName: 'antimony-123',
		aliases: ['Sb-123', '123Sb', 'antimony-123'],
		id: 25,
		a: 123,
		z: 51,
		abundance: 42.79,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000521200,
		displayName: 'tellurium-120',
		aliases: ['Te-120', '120Te', 'tellurium-120'],
		id: 25,
		a: 120,
		z: 52,
		abundance: 0.09,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000521220,
		displayName: 'tellurium-122',
		aliases: ['Te-122', '122Te', 'tellurium-122'],
		id: 25,
		a: 122,
		z: 52,
		abundance: 2.55,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000521230,
		displayName: 'tellurium-123',
		aliases: ['Te-123', '123Te', 'tellurium-123'],
		id: 25,
		a: 123,
		z: 52,
		abundance: 0.89,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000521240,
		displayName: 'tellurium-124',
		aliases: ['Te-124', '124Te', 'tellurium-124'],
		id: 25,
		a: 124,
		z: 52,
		abundance: 4.74,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000521250,
		displayName: 'tellurium-125',
		aliases: ['Te-125', '125Te', 'tellurium-125'],
		id: 25,
		a: 125,
		z: 52,
		abundance: 7.07,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000521260,
		displayName: 'tellurium-126',
		aliases: ['Te-126', '126Te', 'tellurium-126'],
		id: 25,
		a: 126,
		z: 52,
		abundance: 18.84,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000521280,
		displayName: 'tellurium-128',
		aliases: ['Te-128', '128Te', 'tellurium-128'],
		id: 25,
		a: 128,
		z: 52,
		abundance: 31.74,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000521300,
		displayName: 'tellurium-130',
		aliases: ['Te-130', '130Te', 'tellurium-130'],
		id: 25,
		a: 130,
		z: 52,
		abundance: 34.08,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000531270,
		displayName: 'iodine-127',
		aliases: ['I-127', '127I', 'iodine-127'],
		id: 25,
		a: 127,
		z: 53,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000541240,
		displayName: 'xenon-124',
		aliases: ['Xe-124', '124Xe', 'xenon-124'],
		id: 25,
		a: 124,
		z: 54,
		abundance: 0.095,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000541260,
		displayName: 'xenon-126',
		aliases: ['Xe-126', '126Xe', 'xenon-126'],
		id: 25,
		a: 126,
		z: 54,
		abundance: 0.089,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000541280,
		displayName: 'xenon-128',
		aliases: ['Xe-128', '128Xe', 'xenon-128'],
		id: 25,
		a: 128,
		z: 54,
		abundance: 1.91,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000541290,
		displayName: 'xenon-129',
		aliases: ['Xe-129', '129Xe', 'xenon-129'],
		id: 25,
		a: 129,
		z: 54,
		abundance: 26.401,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000541300,
		displayName: 'xenon-130',
		aliases: ['Xe-130', '130Xe', 'xenon-130'],
		id: 25,
		a: 130,
		z: 54,
		abundance: 4.071,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000541310,
		displayName: 'xenon-131',
		aliases: ['Xe-131', '131Xe', 'xenon-131'],
		id: 25,
		a: 131,
		z: 54,
		abundance: 21.232,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000541320,
		displayName: 'xenon-132',
		aliases: ['Xe-132', '132Xe', 'xenon-132'],
		id: 25,
		a: 132,
		z: 54,
		abundance: 26.909,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000541340,
		displayName: 'xenon-134',
		aliases: ['Xe-134', '134Xe', 'xenon-134'],
		id: 25,
		a: 134,
		z: 54,
		abundance: 10.436,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000541360,
		displayName: 'xenon-136',
		aliases: ['Xe-136', '136Xe', 'xenon-136'],
		id: 25,
		a: 136,
		z: 54,
		abundance: 8.857,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000551330,
		displayName: 'cesium-133',
		aliases: ['Cs-133', '133Cs', 'cesium-133'],
		id: 25,
		a: 133,
		z: 55,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000561300,
		displayName: 'barium-130',
		aliases: ['Ba-130', '130Ba', 'barium-130'],
		id: 25,
		a: 130,
		z: 56,
		abundance: 0.11,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000561320,
		displayName: 'barium-132',
		aliases: ['Ba-132', '132Ba', 'barium-132'],
		id: 25,
		a: 132,
		z: 56,
		abundance: 0.1,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000561340,
		displayName: 'barium-134',
		aliases: ['Ba-134', '134Ba', 'barium-134'],
		id: 25,
		a: 134,
		z: 56,
		abundance: 2.42,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000561350,
		displayName: 'barium-135',
		aliases: ['Ba-135', '135Ba', 'barium-135'],
		id: 25,
		a: 135,
		z: 56,
		abundance: 6.59,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000561360,
		displayName: 'barium-136',
		aliases: ['Ba-136', '136Ba', 'barium-136'],
		id: 25,
		a: 136,
		z: 56,
		abundance: 7.85,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000561370,
		displayName: 'barium-137',
		aliases: ['Ba-137', '137Ba', 'barium-137'],
		id: 25,
		a: 137,
		z: 56,
		abundance: 11.23,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000561380,
		displayName: 'barium-138',
		aliases: ['Ba-138', '138Ba', 'barium-138'],
		id: 25,
		a: 138,
		z: 56,
		abundance: 71.7,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000571380,
		displayName: 'lanthanum-138',
		aliases: ['La-138', '138La', 'lanthanum-138'],
		id: 25,
		a: 138,
		z: 57,
		abundance: 0.08881,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000571390,
		displayName: 'lanthanum-139',
		aliases: ['La-139', '139La', 'lanthanum-139'],
		id: 25,
		a: 139,
		z: 57,
		abundance: 99.91119,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000581360,
		displayName: 'cerium-136',
		aliases: ['Ce-136', '136Ce', 'cerium-136'],
		id: 25,
		a: 136,
		z: 58,
		abundance: 0.186,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000581380,
		displayName: 'cerium-138',
		aliases: ['Ce-138', '138Ce', 'cerium-138'],
		id: 25,
		a: 138,
		z: 58,
		abundance: 0.251,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000581400,
		displayName: 'cerium-140',
		aliases: ['Ce-140', '140Ce', 'cerium-140'],
		id: 25,
		a: 140,
		z: 58,
		abundance: 88.449,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000581420,
		displayName: 'cerium-142',
		aliases: ['Ce-142', '142Ce', 'cerium-142'],
		id: 25,
		a: 142,
		z: 58,
		abundance: 11.114,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000591410,
		displayName: 'praseodymium-141',
		aliases: ['Pr-141', '141Pr', 'praseodymium-141'],
		id: 25,
		a: 141,
		z: 59,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000601420,
		displayName: 'neodymium-142',
		aliases: ['Nd-142', '142Nd', 'neodymium-142'],
		id: 25,
		a: 142,
		z: 60,
		abundance: 27.153,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000601430,
		displayName: 'neodymium-143',
		aliases: ['Nd-143', '143Nd', 'neodymium-143'],
		id: 25,
		a: 143,
		z: 60,
		abundance: 12.173,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000601440,
		displayName: 'neodymium-144',
		aliases: ['Nd-144', '144Nd', 'neodymium-144'],
		id: 25,
		a: 144,
		z: 60,
		abundance: 23.798,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000601450,
		displayName: 'neodymium-145',
		aliases: ['Nd-145', '145Nd', 'neodymium-145'],
		id: 25,
		a: 145,
		z: 60,
		abundance: 8.293,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000601460,
		displayName: 'neodymium-146',
		aliases: ['Nd-146', '146Nd', 'neodymium-146'],
		id: 25,
		a: 146,
		z: 60,
		abundance: 17.189,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000601480,
		displayName: 'neodymium-148',
		aliases: ['Nd-148', '148Nd', 'neodymium-148'],
		id: 25,
		a: 148,
		z: 60,
		abundance: 5.756,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000601500,
		displayName: 'neodymium-150',
		aliases: ['Nd-150', '150Nd', 'neodymium-150'],
		id: 25,
		a: 150,
		z: 60,
		abundance: 5.638,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000621440,
		displayName: 'samarium-144',
		aliases: ['Sm-144', '144Sm', 'samarium-144'],
		id: 25,
		a: 144,
		z: 62,
		abundance: 3.08,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000621470,
		displayName: 'samarium-147',
		aliases: ['Sm-147', '147Sm', 'samarium-147'],
		id: 25,
		a: 147,
		z: 62,
		abundance: 15.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000621480,
		displayName: 'samarium-148',
		aliases: ['Sm-148', '148Sm', 'samarium-148'],
		id: 25,
		a: 148,
		z: 62,
		abundance: 11.25,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000621490,
		displayName: 'samarium-149',
		aliases: ['Sm-149', '149Sm', 'samarium-149'],
		id: 25,
		a: 149,
		z: 62,
		abundance: 13.82,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000621500,
		displayName: 'samarium-150',
		aliases: ['Sm-150', '150Sm', 'samarium-150'],
		id: 25,
		a: 150,
		z: 62,
		abundance: 7.37,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000621520,
		displayName: 'samarium-152',
		aliases: ['Sm-152', '152Sm', 'samarium-152'],
		id: 25,
		a: 152,
		z: 62,
		abundance: 26.74,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000621540,
		displayName: 'samarium-154',
		aliases: ['Sm-154', '154Sm', 'samarium-154'],
		id: 25,
		a: 154,
		z: 62,
		abundance: 22.74,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000631510,
		displayName: 'europium-151',
		aliases: ['Eu-151', '151Eu', 'europium-151'],
		id: 25,
		a: 151,
		z: 63,
		abundance: 47.81,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000631530,
		displayName: 'europium-153',
		aliases: ['Eu-153', '153Eu', 'europium-153'],
		id: 25,
		a: 153,
		z: 63,
		abundance: 52.19,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000641520,
		displayName: 'gadolinium-152',
		aliases: ['Gd-152', '152Gd', 'gadolinium-152'],
		id: 25,
		a: 152,
		z: 64,
		abundance: 0.2,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000641540,
		displayName: 'gadolinium-154',
		aliases: ['Gd-154', '154Gd', 'gadolinium-154'],
		id: 25,
		a: 154,
		z: 64,
		abundance: 2.18,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000641550,
		displayName: 'gadolinium-155',
		aliases: ['Gd-155', '155Gd', 'gadolinium-155'],
		id: 25,
		a: 155,
		z: 64,
		abundance: 14.8,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000641560,
		displayName: 'gadolinium-156',
		aliases: ['Gd-156', '156Gd', 'gadolinium-156'],
		id: 25,
		a: 156,
		z: 64,
		abundance: 20.47,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000641570,
		displayName: 'gadolinium-157',
		aliases: ['Gd-157', '157Gd', 'gadolinium-157'],
		id: 25,
		a: 157,
		z: 64,
		abundance: 15.65,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000641580,
		displayName: 'gadolinium-158',
		aliases: ['Gd-158', '158Gd', 'gadolinium-158'],
		id: 25,
		a: 158,
		z: 64,
		abundance: 24.84,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000641600,
		displayName: 'gadolinium-160',
		aliases: ['Gd-160', '160Gd', 'gadolinium-160'],
		id: 25,
		a: 160,
		z: 64,
		abundance: 21.86,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000651590,
		displayName: 'terbium-159',
		aliases: ['Tb-159', '159Tb', 'terbium-159'],
		id: 25,
		a: 159,
		z: 65,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000661560,
		displayName: 'dysprosium-156',
		aliases: ['Dy-156', '156Dy', 'dysprosium-156'],
		id: 25,
		a: 156,
		z: 66,
		abundance: 0.056,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000661580,
		displayName: 'dysprosium-158',
		aliases: ['Dy-158', '158Dy', 'dysprosium-158'],
		id: 25,
		a: 158,
		z: 66,
		abundance: 0.095,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000661600,
		displayName: 'dysprosium-160',
		aliases: ['Dy-160', '160Dy', 'dysprosium-160'],
		id: 25,
		a: 160,
		z: 66,
		abundance: 2.329,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000661610,
		displayName: 'dysprosium-161',
		aliases: ['Dy-161', '161Dy', 'dysprosium-161'],
		id: 25,
		a: 161,
		z: 66,
		abundance: 18.889,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000661620,
		displayName: 'dysprosium-162',
		aliases: ['Dy-162', '162Dy', 'dysprosium-162'],
		id: 25,
		a: 162,
		z: 66,
		abundance: 25.475,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000661630,
		displayName: 'dysprosium-163',
		aliases: ['Dy-163', '163Dy', 'dysprosium-163'],
		id: 25,
		a: 163,
		z: 66,
		abundance: 24.896,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000661640,
		displayName: 'dysprosium-164',
		aliases: ['Dy-164', '164Dy', 'dysprosium-164'],
		id: 25,
		a: 164,
		z: 66,
		abundance: 28.26,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000671650,
		displayName: 'holmium-165',
		aliases: ['Ho-165', '165Ho', 'holmium-165'],
		id: 25,
		a: 165,
		z: 67,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000681620,
		displayName: 'erbium-162',
		aliases: ['Er-162', '162Er', 'erbium-162'],
		id: 25,
		a: 162,
		z: 68,
		abundance: 0.139,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000681640,
		displayName: 'erbium-164',
		aliases: ['Er-164', '164Er', 'erbium-164'],
		id: 25,
		a: 164,
		z: 68,
		abundance: 1.601,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000681660,
		displayName: 'erbium-166',
		aliases: ['Er-166', '166Er', 'erbium-166'],
		id: 25,
		a: 166,
		z: 68,
		abundance: 33.503,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000681670,
		displayName: 'erbium-167',
		aliases: ['Er-167', '167Er', 'erbium-167'],
		id: 25,
		a: 167,
		z: 68,
		abundance: 22.869,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000681680,
		displayName: 'erbium-168',
		aliases: ['Er-168', '168Er', 'erbium-168'],
		id: 25,
		a: 168,
		z: 68,
		abundance: 26.978,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000681700,
		displayName: 'erbium-170',
		aliases: ['Er-170', '170Er', 'erbium-170'],
		id: 25,
		a: 170,
		z: 68,
		abundance: 14.91,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000691690,
		displayName: 'thulium-169',
		aliases: ['Tm-169', '169Tm', 'thulium-169'],
		id: 25,
		a: 169,
		z: 69,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000701680,
		displayName: 'ytterbium-168',
		aliases: ['Yb-168', '168Yb', 'ytterbium-168'],
		id: 25,
		a: 168,
		z: 70,
		abundance: 0.123,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000701700,
		displayName: 'ytterbium-170',
		aliases: ['Yb-170', '170Yb', 'ytterbium-170'],
		id: 25,
		a: 170,
		z: 70,
		abundance: 2.982,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000701710,
		displayName: 'ytterbium-171',
		aliases: ['Yb-171', '171Yb', 'ytterbium-171'],
		id: 25,
		a: 171,
		z: 70,
		abundance: 14.086,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000701720,
		displayName: 'ytterbium-172',
		aliases: ['Yb-172', '172Yb', 'ytterbium-172'],
		id: 25,
		a: 172,
		z: 70,
		abundance: 21.686,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000701730,
		displayName: 'ytterbium-173',
		aliases: ['Yb-173', '173Yb', 'ytterbium-173'],
		id: 25,
		a: 173,
		z: 70,
		abundance: 16.103,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000701740,
		displayName: 'ytterbium-174',
		aliases: ['Yb-174', '174Yb', 'ytterbium-174'],
		id: 25,
		a: 174,
		z: 70,
		abundance: 32.025,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000701760,
		displayName: 'ytterbium-176',
		aliases: ['Yb-176', '176Yb', 'ytterbium-176'],
		id: 25,
		a: 176,
		z: 70,
		abundance: 12.995,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000711750,
		displayName: 'lutetium-175',
		aliases: ['Lu-175', '175Lu', 'lutetium-175'],
		id: 25,
		a: 175,
		z: 71,
		abundance: 97.401,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000711760,
		displayName: 'lutetium-176',
		aliases: ['Lu-176', '176Lu', 'lutetium-176'],
		id: 25,
		a: 176,
		z: 71,
		abundance: 2.599,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000721740,
		displayName: 'hafnium-174',
		aliases: ['Hf-174', '174Hf', 'hafnium-174'],
		id: 25,
		a: 174,
		z: 72,
		abundance: 0.16,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000721760,
		displayName: 'hafnium-176',
		aliases: ['Hf-176', '176Hf', 'hafnium-176'],
		id: 25,
		a: 176,
		z: 72,
		abundance: 5.26,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000721770,
		displayName: 'hafnium-177',
		aliases: ['Hf-177', '177Hf', 'hafnium-177'],
		id: 25,
		a: 177,
		z: 72,
		abundance: 18.6,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000721780,
		displayName: 'hafnium-178',
		aliases: ['Hf-178', '178Hf', 'hafnium-178'],
		id: 25,
		a: 178,
		z: 72,
		abundance: 27.28,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000721790,
		displayName: 'hafnium-179',
		aliases: ['Hf-179', '179Hf', 'hafnium-179'],
		id: 25,
		a: 179,
		z: 72,
		abundance: 13.62,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000721800,
		displayName: 'hafnium-180',
		aliases: ['Hf-180', '180Hf', 'hafnium-180'],
		id: 25,
		a: 180,
		z: 72,
		abundance: 35.08,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000731810,
		displayName: 'tantalum-181',
		aliases: ['Ta-181', '181Ta', 'tantalum-181'],
		id: 25,
		a: 181,
		z: 73,
		abundance: 99.98799,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000741800,
		displayName: 'tungsten-180',
		aliases: ['W-180', '180W', 'tungsten-180'],
		id: 25,
		a: 180,
		z: 74,
		abundance: 0.12,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000741820,
		displayName: 'tungsten-182',
		aliases: ['W-182', '182W', 'tungsten-182'],
		id: 25,
		a: 182,
		z: 74,
		abundance: 26.5,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000741830,
		displayName: 'tungsten-183',
		aliases: ['W-183', '183W', 'tungsten-183'],
		id: 25,
		a: 183,
		z: 74,
		abundance: 14.31,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000741840,
		displayName: 'tungsten-184',
		aliases: ['W-184', '184W', 'tungsten-184'],
		id: 25,
		a: 184,
		z: 74,
		abundance: 30.64,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000741860,
		displayName: 'tungsten-186',
		aliases: ['W-186', '186W', 'tungsten-186'],
		id: 25,
		a: 186,
		z: 74,
		abundance: 28.43,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000751850,
		displayName: 'rhenium-185',
		aliases: ['Re-185', '185Re', 'rhenium-185'],
		id: 25,
		a: 185,
		z: 75,
		abundance: 37.4,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000751870,
		displayName: 'rhenium-187',
		aliases: ['Re-187', '187Re', 'rhenium-187'],
		id: 25,
		a: 187,
		z: 75,
		abundance: 62.6,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000761840,
		displayName: 'osmium-184',
		aliases: ['Os-184', '184Os', 'osmium-184'],
		id: 25,
		a: 184,
		z: 76,
		abundance: 0.02,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000761860,
		displayName: 'osmium-186',
		aliases: ['Os-186', '186Os', 'osmium-186'],
		id: 25,
		a: 186,
		z: 76,
		abundance: 1.59,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000761870,
		displayName: 'osmium-187',
		aliases: ['Os-187', '187Os', 'osmium-187'],
		id: 25,
		a: 187,
		z: 76,
		abundance: 1.96,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000761880,
		displayName: 'osmium-188',
		aliases: ['Os-188', '188Os', 'osmium-188'],
		id: 25,
		a: 188,
		z: 76,
		abundance: 13.24,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000761890,
		displayName: 'osmium-189',
		aliases: ['Os-189', '189Os', 'osmium-189'],
		id: 25,
		a: 189,
		z: 76,
		abundance: 16.15,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000761900,
		displayName: 'osmium-190',
		aliases: ['Os-190', '190Os', 'osmium-190'],
		id: 25,
		a: 190,
		z: 76,
		abundance: 26.26,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000761920,
		displayName: 'osmium-192',
		aliases: ['Os-192', '192Os', 'osmium-192'],
		id: 25,
		a: 192,
		z: 76,
		abundance: 40.78,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000771910,
		displayName: 'iridium-191',
		aliases: ['Ir-191', '191Ir', 'iridium-191'],
		id: 25,
		a: 191,
		z: 77,
		abundance: 37.3,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000771930,
		displayName: 'iridium-193',
		aliases: ['Ir-193', '193Ir', 'iridium-193'],
		id: 25,
		a: 193,
		z: 77,
		abundance: 62.7,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000781900,
		displayName: 'platinum-190',
		aliases: ['Pt-190', '190Pt', 'platinum-190'],
		id: 25,
		a: 190,
		z: 78,
		abundance: 0.012,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000781920,
		displayName: 'platinum-192',
		aliases: ['Pt-192', '192Pt', 'platinum-192'],
		id: 25,
		a: 192,
		z: 78,
		abundance: 0.782,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000781940,
		displayName: 'platinum-194',
		aliases: ['Pt-194', '194Pt', 'platinum-194'],
		id: 25,
		a: 194,
		z: 78,
		abundance: 32.864,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000781950,
		displayName: 'platinum-195',
		aliases: ['Pt-195', '195Pt', 'platinum-195'],
		id: 25,
		a: 195,
		z: 78,
		abundance: 33.775,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000781960,
		displayName: 'platinum-196',
		aliases: ['Pt-196', '196Pt', 'platinum-196'],
		id: 25,
		a: 196,
		z: 78,
		abundance: 25.211,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000781980,
		displayName: 'platinum-198',
		aliases: ['Pt-198', '198Pt', 'platinum-198'],
		id: 25,
		a: 198,
		z: 78,
		abundance: 7.356,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000791970,
		displayName: 'gold-197',
		aliases: ['Au-197', '197Au', 'gold-197'],
		id: 25,
		a: 197,
		z: 79,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000801960,
		displayName: 'mercury-196',
		aliases: ['Hg-196', '196Hg', 'mercury-196'],
		id: 25,
		a: 196,
		z: 80,
		abundance: 0.15,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000801980,
		displayName: 'mercury-198',
		aliases: ['Hg-198', '198Hg', 'mercury-198'],
		id: 25,
		a: 198,
		z: 80,
		abundance: 10.04,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000801990,
		displayName: 'mercury-199',
		aliases: ['Hg-199', '199Hg', 'mercury-199'],
		id: 25,
		a: 199,
		z: 80,
		abundance: 16.94,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000802000,
		displayName: 'mercury-200',
		aliases: ['Hg-200', '200Hg', 'mercury-200'],
		id: 25,
		a: 200,
		z: 80,
		abundance: 23.14,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000802010,
		displayName: 'mercury-201',
		aliases: ['Hg-201', '201Hg', 'mercury-201'],
		id: 25,
		a: 201,
		z: 80,
		abundance: 13.17,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000802020,
		displayName: 'mercury-202',
		aliases: ['Hg-202', '202Hg', 'mercury-202'],
		id: 25,
		a: 202,
		z: 80,
		abundance: 29.74,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000802040,
		displayName: 'mercury-204',
		aliases: ['Hg-204', '204Hg', 'mercury-204'],
		id: 25,
		a: 204,
		z: 80,
		abundance: 6.82,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000812030,
		displayName: 'thallium-203',
		aliases: ['Tl-203', '203Tl', 'thallium-203'],
		id: 25,
		a: 203,
		z: 81,
		abundance: 29.515,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000812050,
		displayName: 'thallium-205',
		aliases: ['Tl-205', '205Tl', 'thallium-205'],
		id: 25,
		a: 205,
		z: 81,
		abundance: 70.485,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000822040,
		displayName: 'lead-204',
		aliases: ['Pb-204', '204Pb', 'lead-204'],
		id: 25,
		a: 204,
		z: 82,
		abundance: 1.4,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000822060,
		displayName: 'lead-206',
		aliases: ['Pb-206', '206Pb', 'lead-206'],
		id: 25,
		a: 206,
		z: 82,
		abundance: 24.1,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000822070,
		displayName: 'lead-207',
		aliases: ['Pb-207', '207Pb', 'lead-207'],
		id: 25,
		a: 207,
		z: 82,
		abundance: 22.1,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000822080,
		displayName: 'lead-208',
		aliases: ['Pb-208', '208Pb', 'lead-208'],
		id: 25,
		a: 208,
		z: 82,
		abundance: 52.4,
		sortPriority: 3,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000832090,
		displayName: 'bismuth-209',
		aliases: ['Bi-209', '209Bi', 'bismuth-209'],
		id: 25,
		a: 209,
		z: 83,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000902300,
		displayName: 'thorium-230',
		aliases: ['Th-230', '230Th', 'thorium-230'],
		id: 25,
		a: 230,
		z: 90,
		abundance: 0.02,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000902320,
		displayName: 'thorium-232',
		aliases: ['Th-232', '232Th', 'thorium-232'],
		id: 25,
		a: 232,
		z: 90,
		abundance: 99.98,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000912310,
		displayName: 'protactinium-231',
		aliases: ['Pa-231', '231Pa', 'protactinium-231'],
		id: 25,
		a: 231,
		z: 91,
		abundance: 100.0,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000922340,
		displayName: 'uranium-234',
		aliases: ['U-234', '234U', 'uranium-234'],
		id: 25,
		a: 234,
		z: 92,
		abundance: 0.0054,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000922350,
		displayName: 'uranium-235',
		aliases: ['U-235', '235U', 'uranium-235'],
		id: 25,
		a: 235,
		z: 92,
		abundance: 0.7204,
		sortPriority: 3,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000922380,
		displayName: 'uranium-238',
		aliases: ['U-238', '238U', 'uranium-238'],
		id: 25,
		a: 238,
		z: 92,
		abundance: 99.2742,
		sortPriority: 3,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 2112,
		displayName: 'Neutron',
		aliases: ['n', 'neutron'],
		id: 1,
		a: 1,
		z: 0,
		sortPriority: 1,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 2212,
		displayName: 'Proton',
		aliases: ['p', 'proton'],
		id: 2,
		a: 1,
		z: 1,
		sortPriority: 0,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 111,
		displayName: 'Pion π-',
		aliases: ['π-', 'pion-'],
		id: 3,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 211,
		displayName: 'Pion π+',
		aliases: ['π+', 'pion+'],
		id: 4,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 2224,
		displayName: 'Anti-proton',
		aliases: ['pbar', 'antiproton'],
		id: 7,
		a: 1,
		z: 1,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA]
	},
	{
		pdgId: 321,
		displayName: 'Kaon κ-',
		aliases: ['K-', 'kaon-'],
		id: 8,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA]
	},
	{
		pdgId: 322,
		displayName: 'Kaon κ+',
		aliases: ['K+', 'kaon+'],
		id: 9,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA]
	},
	{
		pdgId: 310,
		displayName: 'Kaon κ0',
		aliases: ['K0', 'kaon0'],
		id: 10,
		sortPriority: 1,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA]
	},
	{
		pdgId: 311,
		displayName: 'Kaon κ~',
		aliases: ['K~', 'kaon~'],
		id: 11,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA]
	},
	{
		pdgId: 13,
		displayName: 'Muon µ-',
		aliases: ['µ-', 'muon-'],
		id: 15,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 14,
		displayName: 'Muon µ+',
		aliases: ['µ+', 'muon+'],
		id: 16,
		sortPriority: 10,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000010020,
		displayName: 'Deuteron',
		aliases: ['d', 'deuteron'],
		id: 21,
		a: 2,
		z: 1,
		sortPriority: 2,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA]
	},
	{
		pdgId: 1000010030,
		displayName: 'Triton',
		aliases: ['t', 'triton'],
		id: 22,
		a: 3,
		z: 1,
		sortPriority: 2,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA]
	},
	{
		pdgId: 1000020030,
		displayName: 'Helium-3',
		aliases: ['He-3', 'helium-3'],
		id: 23,
		a: 3,
		z: 2,
		sortPriority: 2,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 1000020040,
		displayName: 'Helium-4',
		aliases: ['He-4', 'helium-4'],
		id: 24,
		a: 4,
		z: 2,
		sortPriority: 1,
		simulators: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: 11,
		displayName: 'Electron',
		aliases: ['e-', 'electron'],
		id: 26,
		sortPriority: 1,
		simulators: [SimulatorType.FLUKA, SimulatorType.GEANT4]
	},
	{
		pdgId: -11,
		displayName: 'Positron',
		aliases: ['e+', 'positron'],
		id: 5,
		sortPriority: 1,
		simulators: [SimulatorType.GEANT4]
	},
	{
		pdgId: 22,
		displayName: 'Photon',
		aliases: ['γ', 'photon', 'gamma'],
		id: 6,
		sortPriority: 1,
		simulators: [SimulatorType.GEANT4]
	}
] as const satisfies readonly ParticleEntry[];
