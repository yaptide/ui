export type Common<A, B> = {
	[P in keyof A & keyof B]: A[P] | B[P];
};

export type ValidateShape<T, Shape> = T extends Shape
	? Exclude<keyof T, keyof Shape> extends never
		? T
		: never
	: never;
