declare module '*.css';

type Modify<T, R> = Omit<T, keyof R> & R;

type RemoveIndex<T> = {
	[K in keyof T as string extends K ? never : number extends K ? never : K]: T[K];
};
