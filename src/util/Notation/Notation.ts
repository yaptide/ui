import {
	CamelToSnakeCase,
	CamelToSnakeCaseObject,
	SnakeToCamelCase,
	SnakeToCamelCaseObject
} from '../../types/TypeTransformUtil';

/**
 * Converts a string from snake_case to camelCase.
 * @description This function will not convert strings that are already camelCase or do not follow the snake_case convention.
 * @param str The string to convert.
 * @returns The string in camelCase.
 */
export function camelize<T extends string>(str: T): SnakeToCamelCase<T> {
	if (
		str.match(/[\s-]/) || // Should not contain whitespace or dashes
		str.match(/^_/) || // Should not start with an underscore
		str.match(/_$/) || // Should not end with an underscore
		str.match(/__/) || // Should not contain consecutive underscores
		!str.match(/[_]/) || // Should contain at least one underscore
		(str.match(/[A-Z]/) && // If it contains uppercase letters
			str.match(/[a-z]/)) // Should not contain lowercase letters and vice versa
	)
		return str as any;

	return str.toLowerCase().replace(/_([a-z])/g, (_, char) => char.toUpperCase()) as any;
}

/**
 * Converts a string from camelCase to snake_case.
 * @description This function will not convert strings that are already snake_case or do not follow the camelCase convention.
 * @param str The string to convert.
 * @returns The string in snake_case.
 */
export function snakeize<T extends string>(str: T): CamelToSnakeCase<T> {
	if (
		str.match(/[_\s-]/) || // Should not contain underscores, whitespace, or dashes
		!str.match(/^.+[A-Z]/) // Should contain at least one uppercase letter (not at the beginning)
	)
		return str as any;

	return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase() as any;
}

/**
 * Converts an object with camelCase keys to snake_case keys.
 * @param obj The object to convert.
 * @param recursive Whether to recursively convert nested objects (default: false).
 * @returns The object with snake_case keys.
 */
export function camelToSnakeCase<T extends string>(obj: T): CamelToSnakeCase<T>;
export function camelToSnakeCase<T extends string>(obj: T[]): CamelToSnakeCase<T>[];
export function camelToSnakeCase<T extends object>(
	obj: T,
	recursive?: boolean
): CamelToSnakeCaseObject<T>;

export function camelToSnakeCase<T extends unknown>(
	obj: T,
	recursive = false
): CamelToSnakeCaseObject<T> {
	if (typeof obj === 'string') return snakeize(obj as string) as CamelToSnakeCaseObject<T>;
	if (Array.isArray(obj))
		return obj.map(o => {
			if (typeof o === 'string') return snakeize(o as string);
			if (typeof o === 'object' && o) return camelToSnakeCase(o, recursive);

			return o;
		}) as CamelToSnakeCaseObject<T>;

	if (typeof obj === 'object' && obj) {
		return Object.fromEntries(
			Object.entries(obj).map(([key, value]) => [
				snakeize(key),
				recursive ? camelToSnakeCase(value) : value
			])
		) as CamelToSnakeCaseObject<T>;
	}

	return obj as CamelToSnakeCaseObject<T>;
}

/**
 * Converts an object with snake_case keys to camelCase keys.
 * @param obj The object to convert.
 * @param recursive Whether to recursively convert nested objects (default: false).
 * @returns The object with camelCase keys.
 */
export function snakeToCamelCase<T extends string>(obj: T): SnakeToCamelCase<T>;
export function snakeToCamelCase<T extends string>(obj: T[]): SnakeToCamelCase<T>[];
export function snakeToCamelCase<T extends object>(
	obj: T,
	recursive?: boolean
): SnakeToCamelCaseObject<T>;

export function snakeToCamelCase<T extends unknown>(
	obj: T,
	recursive = false
): SnakeToCamelCaseObject<T> {
	if (typeof obj === 'string') return camelize(obj as string) as SnakeToCamelCaseObject<T>;
	if (Array.isArray(obj))
		return obj.map(o => {
			if (typeof o === 'string') return o;
			if (typeof o === 'object' && o) return snakeToCamelCase(o, recursive);

			return o;
		}) as SnakeToCamelCaseObject<T>;
	if (obj && typeof obj === 'object' && obj)
		return Object.fromEntries(
			Object.entries(obj).map(([key, value]) => [
				camelize(key),
				recursive && typeof value !== 'string' ? snakeToCamelCase(value, recursive) : value
			])
		) as SnakeToCamelCaseObject<T>;

	return obj as SnakeToCamelCaseObject<T>;
}
