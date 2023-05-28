import { Equal } from '@mui/styled-engine';

export type Common<A, B> = {
	[P in keyof A & keyof B]: A[P] | B[P];
};

type ValidateKeys<T, Shape> = Equal<keyof T, keyof Shape, T, never>;

export type ValidateShape<T, Shape> = T extends Shape ? ValidateKeys<T, Shape> : never;
