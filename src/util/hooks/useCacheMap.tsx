import { useCallback, useMemo, useRef } from 'react';

function isPromise<T>(value: any): value is Promise<T> {
	return value && typeof value.then === 'function';
}

export const useCacheMap = <T extends {}>() => {
	const cacheMap = useRef(new Map<string, T | Promise<T>>());

	const set = useCallback(
		(
			key: string,
			value: T | Promise<T>,
			beforeWriteCallback?: (key: string, value: T) => void
		) => {
			if (beforeWriteCallback && !isPromise(value)) beforeWriteCallback(key, value);
			cacheMap.current.set(key, value);
		},
		[]
	);

	const methods = useMemo(() => {
		return {
			createPromise: (
				fn: (resolve: (value: T | PromiseLike<T>) => void) => void,
				key: string,
				beforeWriteCallback?: (key: string, value: T) => void
			) => {
				const cachePromise = new Promise<T>(async (resolve, reject) => fn(resolve)).then(
					data => {
						set(key, data, beforeWriteCallback);
						return data;
					}
				);

				set(key, cachePromise);

				return cachePromise;
			},
			set,
			get: cacheMap.current.get.bind(cacheMap.current),
			has: cacheMap.current.has.bind(cacheMap.current),
			delete: cacheMap.current.delete.bind(cacheMap.current)
		};
	}, [set]);

	return methods;
};
