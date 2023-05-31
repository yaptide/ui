import { SimulationSceneChild, SimulationSceneContainer } from './SimulationContainer';

type ChildMethods<
	ChildName extends string,
	Prefix extends string = '',
	Suffix extends string = ''
> = `${Prefix}${'' extends Prefix ? ChildName : Capitalize<ChildName>}${Capitalize<Suffix>}`;

type ChildMethodsManage<ChildName extends string> = ChildMethods<ChildName, 'add' | 'remove'>;

type ChildMethodsCreate<ChildName extends string> = ChildMethods<ChildName, 'create'>;

type ChildMethodsGet<ChildName extends string> = ChildMethods<
	ChildName,
	'get',
	'byUuid' | 'byName'
>;

type ChildPropertiesContainer<ChildName extends string> = ChildMethods<ChildName, '', 'container'>;

export type SimulationElementManager<
	TName extends string,
	TChild extends SimulationSceneChild,
	TPluralName extends string = `${TName}s`
> = {
	[Method in ChildMethodsManage<TName>]: (...args: [TChild]) => void;
} & {
	[Method in ChildMethodsCreate<TName>]: () => TChild;
} & {
	[Method in ChildMethodsGet<TName>]: (value: string) => TChild | null;
} & {
	[Property in ChildPropertiesContainer<TName>]: SimulationSceneContainer<TChild>;
} & {
	readonly [Property in TPluralName]: TChild[];
};
