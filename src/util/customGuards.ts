export function hasFields<T extends string>(
	obj: unknown,
	...fields: T[]
): obj is {
	[key in T]: unknown;
} {
	return typeof obj === 'object' && obj !== null && fields.every(field => field in obj);
}

type PathToObj<T extends string> = T extends `${infer Head}.${infer Tail}`
	? {
			[key in Head]: PathToObj<Tail>;
	  }
	: T extends string
	? { [key in T]: unknown }
	: never;

export function hasPaths<T extends string>(obj: unknown, ...paths: T[]): obj is PathToObj<T> {
	return paths.every(path => {
		let current = obj;
		for (const field of path.split('.')) {
			if (!hasFields(current, field)) return false;
			current = current[field];
		}
		return true;
	});
}
