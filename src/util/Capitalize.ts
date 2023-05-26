export function Capitalize<T extends string>(str: T) {
	return `${str.charAt(0).toUpperCase()}${str.slice(1)}` as Capitalize<T>;
}
