export function hasField<T extends string>(
	obj: unknown,
	field: T
): obj is {
	[key in T]: unknown;
} {
	return typeof obj === 'object' && obj !== null && field in obj;
}

type PathToObj<T extends string> = T extends `${infer Head}.${infer Tail}`
	? {
			[key in Head]: PathToObj<Tail>;
	  }
	: T extends string
	? { [key in T]: unknown }
	: never;

export function hasPath<T extends string>(obj: unknown, path: T): obj is PathToObj<T> {
	let current = obj;
	for (const field of path.split('.')) {
		if (!hasField(current, field)) return false;
		current = current[field];
	}
	return true;
}
