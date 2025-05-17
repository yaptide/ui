import { ParticleType } from '../ThreeEditor/components/Select/ParticleSelect';

export type Particle = {
	id: number;
	name: string;
};
export const COMMON_PARTICLE_TYPES = [
	{
		id: 1,
		name: 'Neutron'
	},
	{
		id: 2,
		name: 'Proton'
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
		name: 'Anti-proton'
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
		name: 'Deuteron'
	},
	{
		id: 22,
		name: 'Triton'
	},
	{
		id: 23,
		name: 'Helium-3'
	},
	{
		id: 24,
		name: 'Helium-4'
	},
	{
		id: 25,
		name: 'Heavy ions'
	}
] as const satisfies readonly ParticleType[];

export const FLUKA_PARTICLE_TYPES = [
	{
		id: 26,
		name: 'Electron'
	}
] as const satisfies readonly ParticleType[];

export const GEANT4_PARTICLE_TYPES = [
	{
		id: 1,
		name: 'Neutron'
	},
	{
		id: 2,
		name: 'Proton'
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
		name: 'Alpha'
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
		name: '12C'
	}
] as const satisfies readonly ParticleType[];
