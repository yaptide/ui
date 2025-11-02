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
 * Particle types supported by SHIELD-HIT12A and FLUKA
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
		name: 'Heavy ions'
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

/**
 * Particle types supported by Geant4
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
	{
		id: 25,
		name: 'Heavy ions',
		a: 1,
		z: 1
	}
] as const satisfies readonly Particle[];
