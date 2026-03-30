/**
 * List of particles supported by each simulator.
 * SHIELD-HIT and FLUKA share most of the types,
 * while Geant4 has separate list due to how the simulator is integrated.
 */

export interface Particle {
	id: number;
	name: string;
	a?: number;
	z?: number;
}

/**
 * Particle types supported by SHIELD-HIT12A and FLUKA. A and Z are defined for composite particles
 * like deuteron, triton, helium, and heavy ions.
 */
export const COMMON_PARTICLE_TYPES = [
	{
		id: 1,
		name: 'Neutron',
		a: 1,
		z: 0
	},
	{
		id: 2,
		name: 'Proton',
		a: 1,
		z: 1
	},
	{
		id: 3,
		name: 'Pion π-'
	},
	{
		id: 4,
		name: 'Pion π+'
	},
	{
		id: 7,
		name: 'Anti-proton',
		a: 1,
		z: 1
	},
	{
		id: 8,
		name: 'Kaon κ-'
	},
	{
		id: 9,
		name: 'Kaon κ+'
	},
	{
		id: 10,
		name: 'Kaon κ0'
	},
	{
		id: 11,
		name: 'Kaon κ~'
	},
	{
		id: 15,
		name: 'Muon µ-'
	},
	{
		id: 16,
		name: 'Muon µ+'
	},
	{
		id: 21,
		name: 'Deuteron',
		a: 2,
		z: 1
	},
	{
		id: 22,
		name: 'Triton',
		a: 3,
		z: 1
	},
	{
		id: 23,
		name: 'Helium-3',
		a: 3,
		z: 2
	},
	{
		id: 24,
		name: 'Helium-4',
		a: 4,
		z: 2
	},
	{
		id: 25,
		name: 'Heavy Ions',
		a: 12,
		z: 6
	}
] as const satisfies readonly Particle[];

/**
 * Additional particle types supported by FLUKA, but not by SHIELD-HIT12A
 */
export const FLUKA_PARTICLE_TYPES = [
	{
		id: 26,
		name: 'Electron'
	}
] as const satisfies readonly Particle[];

// the most abundant isotopes
export const HEAVY_ION_LIST = [
	{ name: 'Li', a: 7, z: 3 },
	{ name: 'Be', a: 9, z: 4 },
	{ name: 'B', a: 11, z: 5 },
	{ name: 'C', a: 12, z: 6 },
	{ name: 'N', a: 14, z: 7 },
	{ name: 'O', a: 16, z: 8 },
	{ name: 'F', a: 19, z: 9 },
	{ name: 'Ne', a: 20, z: 10 },
	{ name: 'Na', a: 23, z: 11 },
	{ name: 'Mg', a: 24, z: 12 },
	{ name: 'Al', a: 27, z: 13 },
	{ name: 'Si', a: 28, z: 14 },
	{ name: 'P', a: 31, z: 15 },
	{ name: 'S', a: 32, z: 16 },
	{ name: 'Cl', a: 35, z: 17 },
	{ name: 'Ar', a: 40, z: 18 },
	{ name: 'K', a: 39, z: 19 },
	{ name: 'Ca', a: 40, z: 20 },
	{ name: 'Sc', a: 45, z: 21 },
	{ name: 'Ti', a: 48, z: 22 },
	{ name: 'V', a: 51, z: 23 },
	{ name: 'Cr', a: 52, z: 24 },
	{ name: 'Mn', a: 55, z: 25 },
	{ name: 'Fe', a: 56, z: 26 },
	{ name: 'Co', a: 59, z: 27 },
	{ name: 'Ni', a: 58, z: 28 },
	{ name: 'Cu', a: 63, z: 29 },
	{ name: 'Zn', a: 64, z: 30 },
	{ name: 'Ga', a: 69, z: 31 },
	{ name: 'Ge', a: 74, z: 32 },
	{ name: 'As', a: 75, z: 33 },
	{ name: 'Se', a: 80, z: 34 },
	{ name: 'Br', a: 79, z: 35 },
	{ name: 'Kr', a: 84, z: 36 },
	{ name: 'Rb', a: 85, z: 37 },
	{ name: 'Sr', a: 88, z: 38 },
	{ name: 'Y', a: 89, z: 39 },
	{ name: 'Zr', a: 90, z: 40 },
	{ name: 'Nb', a: 93, z: 41 },
	{ name: 'Mo', a: 98, z: 42 },
	{ name: 'Ru', a: 102, z: 44 },
	{ name: 'Rh', a: 103, z: 45 },
	{ name: 'Pd', a: 106, z: 46 },
	{ name: 'Ag', a: 107, z: 47 },
	{ name: 'Cd', a: 114, z: 48 },
	{ name: 'In', a: 115, z: 49 },
	{ name: 'Sn', a: 120, z: 50 },
	{ name: 'Sb', a: 121, z: 51 },
	{ name: 'Te', a: 130, z: 52 },
	{ name: 'I', a: 127, z: 53 },
	{ name: 'Xe', a: 132, z: 54 },
	{ name: 'Cs', a: 133, z: 55 },
	{ name: 'Ba', a: 138, z: 56 },
	{ name: 'La', a: 139, z: 57 },
	{ name: 'Ce', a: 140, z: 58 },
	{ name: 'Pr', a: 141, z: 59 },
	{ name: 'Nd', a: 142, z: 60 },
	{ name: 'Sm', a: 152, z: 62 },
	{ name: 'Eu', a: 153, z: 63 },
	{ name: 'Gd', a: 158, z: 64 },
	{ name: 'Tb', a: 159, z: 65 },
	{ name: 'Dy', a: 164, z: 66 },
	{ name: 'Ho', a: 165, z: 67 },
	{ name: 'Er', a: 166, z: 68 },
	{ name: 'Tm', a: 169, z: 69 },
	{ name: 'Yb', a: 174, z: 70 },
	{ name: 'Lu', a: 175, z: 71 },
	{ name: 'Hf', a: 180, z: 72 },
	{ name: 'Ta', a: 181, z: 73 },
	{ name: 'W', a: 184, z: 74 },
	{ name: 'Re', a: 187, z: 75 },
	{ name: 'Os', a: 192, z: 76 },
	{ name: 'Ir', a: 193, z: 77 },
	{ name: 'Pt', a: 195, z: 78 },
	{ name: 'Au', a: 197, z: 79 },
	{ name: 'Hg', a: 202, z: 80 },
	{ name: 'Tl', a: 205, z: 81 },
	{ name: 'Pb', a: 208, z: 82 },
	{ name: 'Bi', a: 209, z: 83 },
	{ name: 'Th', a: 232, z: 90 },
	{ name: 'Pa', a: 231, z: 91 },
	{ name: 'U', a: 238, z: 92 }
] as const;

// it probably shouldn't be a particle type, id should be 25 and the heavy ion list may have a different type

interface Isotope {
	readonly a: number;
	readonly abundance: number;
}

export const ISOTOPES: Record<string, Isotope[]> = {
	H: [
		{ a: 1, abundance: 99.99 },
		{ a: 2, abundance: 0.01 }
	],
	He: [
		{ a: 4, abundance: 100.0 },
		{ a: 3, abundance: 0.0 }
	],
	Li: [
		{ a: 7, abundance: 95.15 },
		{ a: 6, abundance: 4.85 }
	],
	Be: [{ a: 9, abundance: 100.0 }],
	B: [
		{ a: 11, abundance: 80.35 },
		{ a: 10, abundance: 19.65 }
	],
	C: [
		{ a: 12, abundance: 98.94 },
		{ a: 13, abundance: 1.06 }
	],
	N: [
		{ a: 14, abundance: 99.62 },
		{ a: 15, abundance: 0.38 }
	],
	O: [
		{ a: 16, abundance: 99.76 },
		{ a: 18, abundance: 0.2 },
		{ a: 17, abundance: 0.04 }
	],
	F: [{ a: 19, abundance: 100.0 }],
	Ne: [
		{ a: 20, abundance: 90.48 },
		{ a: 22, abundance: 9.25 },
		{ a: 21, abundance: 0.27 }
	],
	Na: [{ a: 23, abundance: 100.0 }],
	Mg: [
		{ a: 24, abundance: 78.97 },
		{ a: 26, abundance: 11.03 },
		{ a: 25, abundance: 10.01 }
	],
	Al: [{ a: 27, abundance: 100.0 }],
	Si: [
		{ a: 28, abundance: 92.25 },
		{ a: 29, abundance: 4.67 },
		{ a: 30, abundance: 3.07 }
	],
	P: [{ a: 31, abundance: 100.0 }],
	S: [
		{ a: 32, abundance: 94.85 },
		{ a: 34, abundance: 4.37 },
		{ a: 33, abundance: 0.76 },
		{ a: 36, abundance: 0.02 }
	],
	Cl: [
		{ a: 35, abundance: 75.8 },
		{ a: 37, abundance: 24.2 }
	],
	Ar: [
		{ a: 40, abundance: 99.6 },
		{ a: 36, abundance: 0.33 },
		{ a: 38, abundance: 0.06 }
	],
	K: [
		{ a: 39, abundance: 93.26 },
		{ a: 41, abundance: 6.73 },
		{ a: 40, abundance: 0.01 }
	],
	Ca: [
		{ a: 40, abundance: 96.94 },
		{ a: 44, abundance: 2.09 },
		{ a: 42, abundance: 0.65 },
		{ a: 48, abundance: 0.19 },
		{ a: 43, abundance: 0.14 },
		{ a: 46, abundance: 0.0 }
	],
	Sc: [{ a: 45, abundance: 100.0 }],
	Ti: [
		{ a: 48, abundance: 73.72 },
		{ a: 46, abundance: 8.25 },
		{ a: 47, abundance: 7.44 },
		{ a: 49, abundance: 5.41 },
		{ a: 50, abundance: 5.18 }
	],
	V: [
		{ a: 51, abundance: 99.75 },
		{ a: 50, abundance: 0.25 }
	],
	Cr: [
		{ a: 52, abundance: 83.79 },
		{ a: 53, abundance: 9.5 },
		{ a: 50, abundance: 4.34 },
		{ a: 54, abundance: 2.37 }
	],
	Mn: [{ a: 55, abundance: 100.0 }],
	Fe: [
		{ a: 56, abundance: 91.75 },
		{ a: 54, abundance: 5.84 },
		{ a: 57, abundance: 2.12 },
		{ a: 58, abundance: 0.28 }
	],
	Co: [{ a: 59, abundance: 100.0 }],
	Ni: [
		{ a: 58, abundance: 68.08 },
		{ a: 60, abundance: 26.22 },
		{ a: 62, abundance: 3.63 },
		{ a: 61, abundance: 1.14 },
		{ a: 64, abundance: 0.93 }
	],
	Cu: [
		{ a: 63, abundance: 69.15 },
		{ a: 65, abundance: 30.85 }
	],
	Zn: [
		{ a: 64, abundance: 49.17 },
		{ a: 66, abundance: 27.73 },
		{ a: 68, abundance: 18.45 },
		{ a: 67, abundance: 4.04 },
		{ a: 70, abundance: 0.61 }
	],
	Ga: [
		{ a: 69, abundance: 60.11 },
		{ a: 71, abundance: 39.89 }
	],
	Ge: [
		{ a: 74, abundance: 36.52 },
		{ a: 72, abundance: 27.45 },
		{ a: 70, abundance: 20.52 },
		{ a: 73, abundance: 7.76 },
		{ a: 76, abundance: 7.75 }
	],
	As: [{ a: 75, abundance: 100.0 }],
	Se: [
		{ a: 80, abundance: 49.8 },
		{ a: 78, abundance: 23.69 },
		{ a: 76, abundance: 9.23 },
		{ a: 82, abundance: 8.82 },
		{ a: 77, abundance: 7.6 },
		{ a: 74, abundance: 0.86 }
	],
	Br: [
		{ a: 79, abundance: 50.65 },
		{ a: 81, abundance: 49.35 }
	],
	Kr: [
		{ a: 84, abundance: 56.99 },
		{ a: 86, abundance: 17.28 },
		{ a: 82, abundance: 11.59 },
		{ a: 83, abundance: 11.5 },
		{ a: 80, abundance: 2.29 },
		{ a: 78, abundance: 0.35 }
	],
	Rb: [
		{ a: 85, abundance: 72.17 },
		{ a: 87, abundance: 27.83 }
	],
	Sr: [
		{ a: 88, abundance: 82.58 },
		{ a: 86, abundance: 9.86 },
		{ a: 87, abundance: 7.0 },
		{ a: 84, abundance: 0.56 }
	],
	Y: [{ a: 89, abundance: 100.0 }],
	Zr: [
		{ a: 90, abundance: 51.45 },
		{ a: 94, abundance: 17.38 },
		{ a: 92, abundance: 17.15 },
		{ a: 91, abundance: 11.22 },
		{ a: 96, abundance: 2.8 }
	],
	Nb: [{ a: 93, abundance: 100.0 }],
	Mo: [
		{ a: 98, abundance: 24.29 },
		{ a: 96, abundance: 16.67 },
		{ a: 95, abundance: 15.87 },
		{ a: 92, abundance: 14.65 },
		{ a: 100, abundance: 9.74 },
		{ a: 97, abundance: 9.58 },
		{ a: 94, abundance: 9.19 }
	],
	Ru: [
		{ a: 102, abundance: 31.55 },
		{ a: 104, abundance: 18.62 },
		{ a: 101, abundance: 17.06 },
		{ a: 99, abundance: 12.76 },
		{ a: 100, abundance: 12.6 },
		{ a: 96, abundance: 5.54 },
		{ a: 98, abundance: 1.87 }
	],
	Rh: [{ a: 103, abundance: 100.0 }],
	Pd: [
		{ a: 106, abundance: 27.33 },
		{ a: 108, abundance: 26.46 },
		{ a: 105, abundance: 22.33 },
		{ a: 110, abundance: 11.72 },
		{ a: 104, abundance: 11.14 },
		{ a: 102, abundance: 1.02 }
	],
	Ag: [
		{ a: 107, abundance: 51.84 },
		{ a: 109, abundance: 48.16 }
	],
	Cd: [
		{ a: 114, abundance: 28.75 },
		{ a: 112, abundance: 24.11 },
		{ a: 111, abundance: 12.79 },
		{ a: 110, abundance: 12.47 },
		{ a: 113, abundance: 12.23 },
		{ a: 116, abundance: 7.51 },
		{ a: 106, abundance: 1.25 },
		{ a: 108, abundance: 0.89 }
	],
	In: [
		{ a: 115, abundance: 95.72 },
		{ a: 113, abundance: 4.28 }
	],
	Sn: [
		{ a: 120, abundance: 32.58 },
		{ a: 118, abundance: 24.22 },
		{ a: 116, abundance: 14.54 },
		{ a: 119, abundance: 8.59 },
		{ a: 117, abundance: 7.68 },
		{ a: 124, abundance: 5.79 },
		{ a: 122, abundance: 4.63 },
		{ a: 112, abundance: 0.97 },
		{ a: 114, abundance: 0.66 },
		{ a: 115, abundance: 0.34 }
	],
	Sb: [
		{ a: 121, abundance: 57.21 },
		{ a: 123, abundance: 42.79 }
	],
	Te: [
		{ a: 130, abundance: 34.08 },
		{ a: 128, abundance: 31.74 },
		{ a: 126, abundance: 18.84 },
		{ a: 125, abundance: 7.07 },
		{ a: 124, abundance: 4.74 },
		{ a: 122, abundance: 2.55 },
		{ a: 123, abundance: 0.89 },
		{ a: 120, abundance: 0.09 }
	],
	I: [{ a: 127, abundance: 100.0 }],
	Xe: [
		{ a: 132, abundance: 26.91 },
		{ a: 129, abundance: 26.4 },
		{ a: 131, abundance: 21.23 },
		{ a: 134, abundance: 10.44 },
		{ a: 136, abundance: 8.86 },
		{ a: 130, abundance: 4.07 },
		{ a: 128, abundance: 1.91 },
		{ a: 124, abundance: 0.1 },
		{ a: 126, abundance: 0.09 }
	],
	Cs: [{ a: 133, abundance: 100.0 }],
	Ba: [
		{ a: 138, abundance: 71.7 },
		{ a: 137, abundance: 11.23 },
		{ a: 136, abundance: 7.85 },
		{ a: 135, abundance: 6.59 },
		{ a: 134, abundance: 2.42 },
		{ a: 130, abundance: 0.11 },
		{ a: 132, abundance: 0.1 }
	],
	La: [
		{ a: 139, abundance: 99.91 },
		{ a: 138, abundance: 0.09 }
	],
	Ce: [
		{ a: 140, abundance: 88.45 },
		{ a: 142, abundance: 11.11 },
		{ a: 138, abundance: 0.25 },
		{ a: 136, abundance: 0.19 }
	],
	Pr: [{ a: 141, abundance: 100.0 }],
	Nd: [
		{ a: 142, abundance: 27.15 },
		{ a: 144, abundance: 23.8 },
		{ a: 146, abundance: 17.19 },
		{ a: 143, abundance: 12.17 },
		{ a: 145, abundance: 8.29 },
		{ a: 148, abundance: 5.76 },
		{ a: 150, abundance: 5.64 }
	],
	Sm: [
		{ a: 152, abundance: 26.74 },
		{ a: 154, abundance: 22.74 },
		{ a: 147, abundance: 15.0 },
		{ a: 149, abundance: 13.82 },
		{ a: 148, abundance: 11.25 },
		{ a: 150, abundance: 7.37 },
		{ a: 144, abundance: 3.08 }
	],
	Eu: [
		{ a: 153, abundance: 52.19 },
		{ a: 151, abundance: 47.81 }
	],
	Gd: [
		{ a: 158, abundance: 24.84 },
		{ a: 160, abundance: 21.86 },
		{ a: 156, abundance: 20.47 },
		{ a: 157, abundance: 15.65 },
		{ a: 155, abundance: 14.8 },
		{ a: 154, abundance: 2.18 },
		{ a: 152, abundance: 0.2 }
	],
	Tb: [{ a: 159, abundance: 100.0 }],
	Dy: [
		{ a: 164, abundance: 28.26 },
		{ a: 162, abundance: 25.48 },
		{ a: 163, abundance: 24.9 },
		{ a: 161, abundance: 18.89 },
		{ a: 160, abundance: 2.33 },
		{ a: 158, abundance: 0.1 },
		{ a: 156, abundance: 0.06 }
	],
	Ho: [{ a: 165, abundance: 100.0 }],
	Er: [
		{ a: 166, abundance: 33.5 },
		{ a: 168, abundance: 26.98 },
		{ a: 167, abundance: 22.87 },
		{ a: 170, abundance: 14.91 },
		{ a: 164, abundance: 1.6 },
		{ a: 162, abundance: 0.14 }
	],
	Tm: [{ a: 169, abundance: 100.0 }],
	Yb: [
		{ a: 174, abundance: 32.02 },
		{ a: 172, abundance: 21.69 },
		{ a: 173, abundance: 16.1 },
		{ a: 171, abundance: 14.09 },
		{ a: 176, abundance: 12.99 },
		{ a: 170, abundance: 2.98 },
		{ a: 168, abundance: 0.12 }
	],
	Lu: [
		{ a: 175, abundance: 97.4 },
		{ a: 176, abundance: 2.6 }
	],
	Hf: [
		{ a: 180, abundance: 35.08 },
		{ a: 178, abundance: 27.28 },
		{ a: 177, abundance: 18.6 },
		{ a: 179, abundance: 13.62 },
		{ a: 176, abundance: 5.26 },
		{ a: 174, abundance: 0.16 }
	],
	Ta: [{ a: 181, abundance: 99.99 }],
	W: [
		{ a: 184, abundance: 30.64 },
		{ a: 186, abundance: 28.43 },
		{ a: 182, abundance: 26.5 },
		{ a: 183, abundance: 14.31 },
		{ a: 180, abundance: 0.12 }
	],
	Re: [
		{ a: 187, abundance: 62.6 },
		{ a: 185, abundance: 37.4 }
	],
	Os: [
		{ a: 192, abundance: 40.78 },
		{ a: 190, abundance: 26.26 },
		{ a: 189, abundance: 16.15 },
		{ a: 188, abundance: 13.24 },
		{ a: 187, abundance: 1.96 },
		{ a: 186, abundance: 1.59 },
		{ a: 184, abundance: 0.02 }
	],
	Ir: [
		{ a: 193, abundance: 62.7 },
		{ a: 191, abundance: 37.3 }
	],
	Pt: [
		{ a: 195, abundance: 33.77 },
		{ a: 194, abundance: 32.86 },
		{ a: 196, abundance: 25.21 },
		{ a: 198, abundance: 7.36 },
		{ a: 192, abundance: 0.78 },
		{ a: 190, abundance: 0.01 }
	],
	Au: [{ a: 197, abundance: 100.0 }],
	Hg: [
		{ a: 202, abundance: 29.74 },
		{ a: 200, abundance: 23.14 },
		{ a: 199, abundance: 16.94 },
		{ a: 201, abundance: 13.17 },
		{ a: 198, abundance: 10.04 },
		{ a: 204, abundance: 6.82 },
		{ a: 196, abundance: 0.15 }
	],
	Tl: [
		{ a: 205, abundance: 70.48 },
		{ a: 203, abundance: 29.52 }
	],
	Pb: [
		{ a: 208, abundance: 52.4 },
		{ a: 206, abundance: 24.1 },
		{ a: 207, abundance: 22.1 },
		{ a: 204, abundance: 1.4 }
	],
	Bi: [{ a: 209, abundance: 100.0 }],
	Th: [
		{ a: 232, abundance: 99.98 },
		{ a: 230, abundance: 0.02 }
	],
	Pa: [{ a: 231, abundance: 100.0 }],
	U: [
		{ a: 238, abundance: 99.27 },
		{ a: 235, abundance: 0.72 },
		{ a: 234, abundance: 0.01 }
	]
};
/**
 * Particle types supported by Geant4. A and Z are defined for composite particles
 *  * like deuteron, triton, helium, and heavy ions.
 */
export const GEANT4_PARTICLE_TYPES = [
	{
		id: 1,
		name: 'Neutron',
		a: 1,
		z: 0
	},
	{
		id: 2,
		name: 'Proton',
		a: 1,
		z: 1
	},
	{
		id: 3,
		name: 'Photon'
	},
	{
		id: 4,
		name: 'Electron'
	},
	{
		id: 5,
		name: 'Positron'
	},
	{
		id: 6,
		name: 'Alpha',
		a: 4,
		z: 2
	},
	{
		id: 7,
		name: 'Muon µ-'
	},
	{
		id: 8,
		name: 'Muon µ+'
	},
	{
		id: 9,
		name: 'Pion π-'
	},
	{
		id: 10,
		name: 'Pion π+'
	},
	{
		id: 11,
		name: '12C',
		a: 12,
		z: 6
	},
	// ...HEAVY_ION_LIST,
	{
		id: 25,
		name: 'Heavy ions',
		a: 12,
		z: 6
	}
] as const satisfies readonly Particle[];
