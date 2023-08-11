import { SimulationSceneChild, SimulationSceneContainer } from './SimulationContainer';

/**
 * Type inference describing the properties and methods of manager for a given element
 * @template TName The string name of the element
 * @template TChild The type of the element instance that extends SimulationSceneChild
 * @see {@link SimulationSceneChild}
 * @template TPluralName The plural name of the set of elements (defaults to `${TName}s`)
 * @example
 * ```ts
 * class ParticleManager implements SimulationElementManager<'particle', Particle> {
 * 	addParticle: (particle: Particle) => void;
 * 	removeParticle: (particle: Particle) => void;
 * 	createParticle: () => Particle;
 * 	getParticleByUuid: (uuid: string) => Particle | null;
 * 	getParticleByName: (name: string) => Particle | null;
 * 	particleContainer: SimulationSceneContainer<Particle>;
 * 	particles: Particle[];
 * }
 * ```
 */
export type SimulationElementManager<
	TName extends string,
	TChild extends SimulationSceneChild,
	TPluralName extends string = `${TName}s`
> = {
	[Method in ChildMethodsManage<TName>]: (...args: [TChild]) => void;
} & {
	[Method in ChildMethodsGet<TName>]: (value: string) => TChild | null;
} & {
	[Property in ChildPropertiesContainer<TName>]: SimulationSceneContainer<TChild>;
} & {
	readonly [Property in TPluralName]: TChild[];
};

//-----------------------------------------UtilityTypes-----------------------------------------//
type ChildMethods<
	ChildName extends string,
	Prefix extends string = '',
	Suffix extends string = ''
> = `${Prefix}${'' extends Prefix ? ChildName : Capitalize<ChildName>}${Capitalize<Suffix>}`;

type ChildMethodsManage<ChildName extends string> = ChildMethods<ChildName, 'add' | 'remove'>;

type ChildMethodsGet<ChildName extends string> = ChildMethods<
	ChildName,
	'get',
	'byUuid' | 'byName'
>;

type ChildPropertiesContainer<ChildName extends string> = ChildMethods<ChildName, '', 'container'>;
//----------------------------------------------------------------------------------------------//
