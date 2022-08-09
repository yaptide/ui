export type Common<A, B> = {
    [P in keyof A & keyof B]: A[P] | B[P];
}

export const castTo = <T>(x: any): T => { return x as unknown as T; }