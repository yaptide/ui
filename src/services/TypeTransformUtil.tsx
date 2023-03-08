type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
	? `${T extends Uppercase<T> ? '_' : ''}${Lowercase<T>}${CamelToSnakeCase<U>}`
	: S;

type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
	? `${T}${Capitalize<SnakeToCamelCase<U>>}`
	: S;

type TransformerMap<A extends string = never> = {
	Snake: CamelToSnakeCase<A>;
	Camel: SnakeToCamelCase<A>;
};

type TransformCase<T, M extends keyof TransformerMap> = T extends string
	? TransformerMap<T>[M]
	: T extends Array<unknown>
	? Array<TransformCase<T[number], M>>
	: T extends {}
	? { [K in keyof T as TransformCase<K, M>]: TransformCase<T[K], M> }
	: T;

export type CamelToSnakeCaseObject<T> = TransformCase<T, 'Snake'>;

export type SnakeToCamelCaseObject<T> = TransformCase<T, 'Camel'>;

// Example usage:
// type _ = CamelToSnakeCaseObject<{ someProperty: string; anotherProperty: number }>;
// Result: { some_property: string; another_property: number }

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

export type IntersectionToObject<T> = Omit<T, never>;

export type Concat<T extends unknown[][]> = T extends [
	infer H extends unknown[],
	...infer R extends unknown[][]
]
	? [...H, ...Concat<R>]
	: [];

export type TypeIdentifiedByKey<K extends PropertyKey, V, T extends {}> = {
	[P in K | keyof T]: P extends K ? V : (T & Record<K, never>)[P];
};

export type DataWithStatus<T, K extends keyof T, V, U = {}, I = Partial<T>> = V extends null
	? keyof U extends never
		? I
		: IntersectionToObject<I & U>
	: IntersectionToObject<Extract<T, { [X in K]: V }> & U>;

export type LookUp<U, K extends PropertyKey, V = unknown> = U extends { [X in K]: V } ? U : never;

export type ValueOrNever<
	T extends Record<PropertyKey, unknown>,
	K extends PropertyKey
> = K extends keyof T ? T[K] : never;
