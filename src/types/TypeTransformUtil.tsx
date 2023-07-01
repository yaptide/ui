type IsLetter<T extends string> = Uppercase<T> extends Lowercase<T> ? false : true;

/**
 * Determines if a string is valid for snakeize.
 * Should not contain underscores, whitespace, or dashes.
 * First character should not be the only uppercase character.
 * Should contain at least one uppercase character.
 * @template T The string to validate.
 * @template First A boolean indicating if this is the first character being validated.
 * @template Full The full string being validated.
 * @returns T if the string is valid for snakeize, otherwise never.
 */
export type ValidForSnakeize<
	T extends string,
	First extends boolean = true,
	Full extends string = T
> = T extends `${infer F}${infer R}`
	? F extends '_' | ' ' | '-' | '\n' | '\t' | '\r' | '\v' | '\f' | '\b' | '\0'
		? never
		: First extends true
		? (R extends Lowercase<R> ? true : false) extends false
			? ValidForCamelize<R, false, Full>
			: never
		: ValidForSnakeize<R, false, Full>
	: Full;

/**
 * Determines if a string is valid for camelize.
 * Should not contain whitespace, or dashes.
 * Should not start with an underscore.
 * Should contain at least one underscore.
 * Should not contain mixed case.
 * @template T The string to validate.
 * @template First A boolean indicating if this is the first character being validated.
 * @template Full The full string being validated.
 * @returns T if the string is valid for camelize, otherwise never.
 */
export type ValidForCamelize<
	T extends string,
	First extends boolean = true,
	Full extends string = T
> = T extends `${infer F}${infer R}`
	? F extends ' ' | '-' | '\n' | '\t' | '\r' | '\v' | '\f' | '\b' | '\0'
		? never
		: First extends true
		? F extends '_'
			? never
			: boolean extends
					| (T extends Uppercase<T> ? true : false)
					| (T extends Lowercase<T> ? true : false)
			? Full extends `${string}_${string}`
				? ValidForCamelize<R, false, Full>
				: never
			: never
		: ValidForCamelize<R, false, Full>
	: Full;

/**
 * Transforms a string key from camelCase to snake_case.
 */
export type CamelToSnakeCase<S extends string, First extends string = S> = [
	ValidForSnakeize<First>
] extends [never]
	? S
	: S extends `${infer F}${infer S}${infer R}`
	? [S, IsLetter<S>] extends [Uppercase<S>, true]
		? `${Lowercase<F>}_${CamelToSnakeCase<`${Lowercase<S>}${R}`, First>}`
		: `${Lowercase<F>}${CamelToSnakeCase<`${Lowercase<S>}${R}`, First>}`
	: S;

/**
 * Transforms a string key from snake_case to camelCase.
 */
export type SnakeToCamelCase<S extends string, First extends string = S> = [
	ValidForCamelize<First>
] extends [never]
	? S
	: S extends `${infer L}${infer R}`
	? L extends '_'
		? `${Capitalize<SnakeToCamelCase<R, First>>}`
		: `${Lowercase<L>}${SnakeToCamelCase<R, First>}`
	: S;

// Map of transformation functions
type TransformerMap<A extends string = never> = {
	Snake: CamelToSnakeCase<A>;
	Camel: SnakeToCamelCase<A>;
};

// Parametrized type for transforming keys of an object
type TransformCase<T, M extends keyof TransformerMap = keyof TransformerMap> = T extends string
	? TransformerMap<T>[M]
	: T extends Array<unknown>
	? Array<TransformCase<T[number], M>>
	: T extends {}
	? { [K in keyof T as TransformCase<K, M>]: TransformCase<T[K], M> }
	: T;

/**
 * Transforms all keys of an object from camelCase to snake_case.
 * @example
 * ```ts
 * declare x: CamelToSnakeCaseObject<{ someProperty: string; anotherProperty: number }>;
 * x.some_property; // string
 * x.another_property; // number
 * ```
 */
export type CamelToSnakeCaseObject<T> = TransformCase<T, 'Snake'>;
/**
 * Transforms all keys of an object from snake_case to camelCase.
 * @example
 * ```ts
 * declare x: SnakeToCamelCaseObject<{ some_property: string; another_property: number }>;
 * x.someProperty; // string
 * x.anotherProperty; // number
 * ```
 */
export type SnakeToCamelCaseObject<T> = TransformCase<T, 'Camel'>;

/**
 * Flattens a nested array of unknown type into a single array.
 * @example
 * ```ts
 * type NestedArray = [[1, 2], [3, 4], [5, 6]];
 * type FlatArray = Flatten<NestedArray>; // [1, 2, 3, 4, 5, 6]
 * ```
 */
export type Flatten<T extends unknown[][]> = T extends [
	infer H extends unknown[],
	...infer R extends unknown[][]
]
	? [...H, ...Flatten<R>]
	: [];

/**
 * Creates a new type by adding or replacing a key of type `K` with a value of type `V` to an existing type `T`.
 * @example
 * ```ts
 * type Person = { name: string; age: number };
 * type PersonWithId = TypeIdentifiedByKey<'id', string, Person>; // { id: string; name: string; age: number }
 * ```
 */
export type TypeIdentifiedByKey<K extends PropertyKey, V, T extends {}> = {
	[P in K | keyof T]: P extends K ? V : (T & Record<K, never>)[P];
};

/**
 * Extracts a subset of a union type `U` that has a required key `K` of value type `V`.
 * @example
 * ```ts
 * type User = { id: number; name: string } | { id: string; name: string };
 * type UserWithStringId = LookUp<User, 'id', string>; // { id: string; name: string }
 * ```
 */
export type LookUp<U, K extends PropertyKey, V = unknown> = Extract<U, { [X in K]: V }>;

/**
 * A parametrized object union type with Generalized type T, wanted key K and value type V and additional static object intersection U.
 * @template T - The generalized type of the object union.
 * @template K - The key of the object union to be looked up.
 * @template V - The value type of the key to be looked up.
 * @template U - The additional static object intersection.
 * @template I - The partial type of the generalized type T.
 * @example
 * ```ts
 * type Animal = { name: string; voice: 'bark' } | { name: string; voice: 'meow' };
 * type AnimalWithVoice<T=null> = DataWithStatus<Animal, 'voice', T>; // { name: string; voice: 'bark' | 'meow' }
 * declare dog: AnimalWithVoice<'bark'>; // { name: string; voice: 'bark' }
 * ```
 */
// Parametrized object union type with Generalized type T, wanted key K and value type V and additional static object intersection U
export type DataWithStatus<T, K extends keyof T, V, U = {}, I = Partial<T>> = V extends null
	? keyof U extends never
		? I
		: Omit<I & U, never>
	: Omit<LookUp<T, K, V> & U, never>;

/**
 * Transforms a union type to an intersection type.
 * @example
 * ```ts
 * type Union = {a: string} | {b: number};
 * type Intersection = UnionToIntersection<Union>; // {a: string, b: number}
 * ```
 */
type UnionToIntersection<U> = (U extends U ? (x: U) => unknown : never) extends (
	x: infer R
) => unknown
	? R
	: never;

/**
 * Transforms an object type where shared keys are unioned into a key union type.
 * @example
 * ```ts
 * type Obj = { a: string, b: number } | { a: number };
 * type KeyUnion = ObjUnionToKeyUnion<Obj>; // { a: string | number, b: number }
 * ```
 */
export type ObjUnionToKeyUnion<T extends {}, Obj extends {} = {}> = UnionToIntersection<
	T extends any ? () => T : never
> extends () => infer ReturnType
	? ObjUnionToKeyUnion<
			Exclude<T, ReturnType>,
			Omit<
				Omit<Obj, keyof ReturnType> & {
					[K in keyof ReturnType]: (K extends keyof Obj ? Obj[K] : never) | ReturnType[K];
				},
				never
			>
	  >
	: Omit<Obj, never>;

/**
 * Transforms an array of key-value pairs into an object type.
 * @example
 * ```ts
 * const entries = [['a', 1], ['b', '2']] as const;
 * type Result = EntriesToObj<typeof entries>; // { a: 1, b: '2' }
 * ```
 */
export type EntriesToObj<T extends readonly [PropertyKey, unknown][]> = {
	[K in T[number][0]]: Extract<T[number], [K, unknown]>[1];
};

/**
 * Returns the keys of an object type that are optional.
 * @example
 * ```ts
 * type Obj = { a: string; b?: number; c: boolean };
 * type OptionalKeys = OptionalKeys<Obj>; // 'b'
 * ```
 */
export type OptionalKeys<T> = keyof {
	[K in keyof T as [<S>() => S extends { [Z in K]: Exclude<T, T> } ? 1 : 0] extends [
		<S>() => S extends { [Z in K]-?: Exclude<T, T> } ? 1 : 0
	]
		? never
		: K]: never;
};

/**
 * Returns the keys of an object type that are required.
 * @example
 * ```ts
 * type Obj = { a: string; b?: number; c: boolean };
 * type RequiredKeys = RequiredKeys<Obj>; // 'a' | 'c'
 * ```
 */
export type RequiredKeys<T extends object> = keyof {
	[K in keyof T as [<S>() => S extends { [Z in K]: Exclude<T, T> } ? 1 : 0] extends [
		<S>() => S extends { [Z in K]-?: Exclude<T, T> } ? 1 : 0
	]
		? K
		: never]: never;
};
