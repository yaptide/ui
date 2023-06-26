type IsLetter<T extends string> = Uppercase<T> extends Lowercase<T> ? false : true;

// Determine if a string is valid for snakeize
// Should not contain underscores, whitespace, or dashes
// First character should not be the only uppercase character
// return T or never
export type ValidForSnakeize<
	T extends string,
	First extends boolean = true,
	Full extends string = T
> = T extends `${infer F}${infer R}`
	? F extends '_' | ' ' | '-' | '\n' | '\t' | '\r' | '\v' | '\f' | '\b' | '\0'
		? never
		: First extends true
		? [
				(F extends Uppercase<F> ? true : false) | (R extends Lowercase<R> ? true : false)
		  ] extends [true]
			? ValidForCamelize<R, false, Full>
			: never
		: ValidForSnakeize<R, false, Full>
	: Full;

// Determine if a string is valid for camelize
// Should not contain whitespace, or dashes
// Should not start with an underscore
// Should not contain mixed case
// return T or never
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
			? ValidForCamelize<R, false, Full>
			: never
		: ValidForCamelize<R, false, Full>
	: Full;

// Transform string key from camelCase to snake_case
export type CamelToSnakeCase<S extends string, First extends string = S> = [
	ValidForSnakeize<First>
] extends [never]
	? S
	: S extends `${infer F}${infer S}${infer R}`
	? [S, IsLetter<S>] extends [Uppercase<S>, true]
		? `${Lowercase<F>}_${CamelToSnakeCase<`${Lowercase<S>}${R}`, First>}`
		: `${Lowercase<F>}${CamelToSnakeCase<`${Lowercase<S>}${R}`, First>}`
	: S;

// Transform string key from snake_case to camelCase
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

// Generalized types for transforming keys of an object
export type CamelToSnakeCaseObject<T> = TransformCase<T, 'Snake'>;
export type SnakeToCamelCaseObject<T> = TransformCase<T, 'Camel'>;

// Example usage:
// type _ = CamelToSnakeCaseObject<{ someProperty: string; anotherProperty: number }>;
// Result: { some_property: string; another_property: number }

// Merge intersection of two object types into one object type
export type IntersectionToObject<T> = Omit<T, never>;

// Flatten array of arrays type
export type Flatten<T extends unknown[][]> = T extends [
	infer H extends unknown[],
	...infer R extends unknown[][]
]
	? [...H, ...Flatten<R>]
	: [];

// Parametrized object type with required key K of value type V
export type TypeIdentifiedByKey<K extends PropertyKey, V, T extends {}> = {
	[P in K | keyof T]: P extends K ? V : (T & Record<K, never>)[P];
};

// Type of object union type with required key K of value type V
export type LookUp<U, K extends PropertyKey, V = unknown> = Extract<U, { [X in K]: V }>;

// Parametrized object union type with Generalized type T, wanted key K and value type V and additional static object intersection U
export type DataWithStatus<T, K extends keyof T, V, U = {}, I = Partial<T>> = V extends null
	? keyof U extends never
		? I
		: IntersectionToObject<I & U>
	: IntersectionToObject<LookUp<T, K, V> & U>;

// Type transformation from union to intersection ex: {a: string} | {b: number} => {a: string, b: number}
type UnionToIntersection<U> = (U extends U ? (x: U) => unknown : never) extends (
	x: infer R
) => unknown
	? R
	: never;

// Specific type transformation for object where shared keys are unioned ex: {a: string, b: number} | {a: number} => {a: string | number, b: number}
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
