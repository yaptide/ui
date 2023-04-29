declare module '*.css';

type Modify<T, R> = Omit<T, keyof R> & R;
