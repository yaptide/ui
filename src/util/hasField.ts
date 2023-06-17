export function hasField<T extends string>(
	obj: unknown,
	field: T
): obj is {
	[key in T]: unknown;
} {
	return typeof obj === 'object' && obj !== null && field in obj;
}
