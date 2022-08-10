export type Common<A, B> = {
    [P in keyof A & keyof B]: A[P] | B[P];
}
