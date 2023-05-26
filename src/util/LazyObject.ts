import { useEffect, useState } from 'react';

export const PROPERTY_TYPE_SYMBOL = Symbol('PROPERTY_TYPE_SYMBOL');
export const LAZY_PROPERTY_SYMBOL = Symbol('LAZY_PROPERTY_SYMBOL');
export const PENDING_PROPERTY_SYMBOL = Symbol('PENDING_PROPERTY_SYMBOL');

interface LazyProperty<T> {
	[PROPERTY_TYPE_SYMBOL]: typeof LAZY_PROPERTY_SYMBOL | typeof PENDING_PROPERTY_SYMBOL;
	value: () => Promise<T>;
}

export const lazyProperty = <T>(value: () => Promise<T>): LazyProperty<T> => {
	return {
		[PROPERTY_TYPE_SYMBOL]: LAZY_PROPERTY_SYMBOL,
		value
	};
};

export const isLazyProperty = <T>(value: any): value is LazyProperty<T> => {
	return value && value[PROPERTY_TYPE_SYMBOL] === LAZY_PROPERTY_SYMBOL;
};

export type MapToLazy<T> = {
	[K in keyof T]: T[K] | LazyProperty<T>;
};

export const useLazyObjectState = <T>(lazyObject: MapToLazy<T>) => {
	const [state, setState] = useState({ proxy: undefined as Partial<T> | undefined });

	useEffect(() => {
		const objectProxy = new Proxy(lazyObject, {
			get: (target, prop) => {
				const key = prop as keyof T;
				const value = target[key];

				if (isLazyProperty(value) && value[PROPERTY_TYPE_SYMBOL] === LAZY_PROPERTY_SYMBOL) {
					value[PROPERTY_TYPE_SYMBOL] = PENDING_PROPERTY_SYMBOL;
					value.value().then(resolvedValue => {
						target[key] = resolvedValue as any;
						setState({ proxy: objectProxy as Partial<T> });
					});
					return undefined;
				}
				return value;
			}
		});
		setState({ proxy: objectProxy as Partial<T> });
	}, [lazyObject]);

	return [state.proxy];
};
