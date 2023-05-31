type IsLetter<T extends string> = Uppercase<T> extends Lowercase<T> ? false : true;

// Transform string key from camelCase to snake_case
type CamelToSnakeCase<S extends string> = S extends `${infer F}${infer S}${infer R}`
	? [S, IsLetter<S>] extends [Uppercase<S>, true]
		? `${Lowercase<F>}_${CamelToSnakeCase<`${Lowercase<S>}${R}`>}`
		: `${Lowercase<F>}${CamelToSnakeCase<`${Lowercase<S>}${R}`>}`
	: S;

// Transform string key from snake_case to camelCase
type SnakeToCamelCase<S extends string> = S extends `${infer L}${infer R}`
	? L extends '_'
		? `${Capitalize<SnakeToCamelCase<R>>}`
		: `${Lowercase<L>}${SnakeToCamelCase<R>}`
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

// Utility functions for transforming keys of an object
const camelize = <T extends string>(str: T): SnakeToCamelCase<T> =>
	str.replace(/_([a-z])/g, (_, char) => char.toUpperCase()) as SnakeToCamelCase<T>;

const snakeize = <T extends string>(str: T): CamelToSnakeCase<T> =>
	str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase() as CamelToSnakeCase<T>;

export const camelToSnakeCase = <T extends unknown>(
	obj: T,
	recursive = false
): CamelToSnakeCaseObject<T> => {
	if (recursive && Array.isArray(obj) && typeof obj !== 'string')
		return obj.map(o => camelToSnakeCase(o, recursive)) as CamelToSnakeCaseObject<T>;
	if (typeof obj === 'object') {
		return Object.fromEntries(
			Object.entries(obj as Object).map(([key, value]) => [
				snakeize(key),
				recursive ? camelToSnakeCase(value, recursive) : value
			])
		) as CamelToSnakeCaseObject<T>;
	}
	return obj as CamelToSnakeCaseObject<T>;
};

export const snakeToCamelCase = <T extends unknown>(
	obj: T,
	recursive = false
): SnakeToCamelCaseObject<T> => {
	if (recursive && Array.isArray(obj) && typeof obj !== 'string')
		return obj.map(o => snakeToCamelCase(o, recursive)) as SnakeToCamelCaseObject<T>;
	if (obj && typeof obj === 'object')
		return Object.fromEntries(
			Object.entries(obj as Object).map(([key, value]) => [
				camelize(key),
				recursive ? snakeToCamelCase(value, recursive) : value
			])
		) as SnakeToCamelCaseObject<T>;

	return obj as SnakeToCamelCaseObject<T>;
};

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

export type PartialSubtype<T, Required extends keyof T> = Omit<
	Partial<Omit<T, Required>> & Pick<T, Required>,
	never
>;
