import { ParticleType } from '../ThreeEditor/components/Select/ParticleSelect';

export type Particle = {
	id: number;
	name: string;
};
export const PARTICLE_TYPES = [
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
		id: 5,
		name: 'Pion π0'
	},
	{
		id: 6,
		name: 'Anti-neutron'
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
	}
] as const satisfies readonly ParticleType[];
