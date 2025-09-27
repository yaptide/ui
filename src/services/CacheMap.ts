function isPromise<T>(value: any): value is Promise<T> {
	return value && typeof value.then === 'function';
}

export default class CacheMap<T extends {}> {
	data: Map<string, T | Promise<T>>;

	constructor() {
		this.data = new Map();
	}

	get(key: string) {
		return this.data.get(key);
	}

	set(
		key: string,
		value: T | Promise<T>,
		beforeWriteCallback?: (key: string, value: T) => void
	): void {
		if (beforeWriteCallback && !isPromise(value)) beforeWriteCallback(key, value);
		this.data.set(key, value);
	}

	has(key: string) {
		return this.data.has(key);
	}

	delete(key: string) {
		return this.data.delete(key);
	}

	createPromise(
		fn: (resolve: (value: T | PromiseLike<T>) => void) => void,
		key: string,
		beforeWriteCallback?: (key: string, value: T) => void
	) {
		const cachePromise = new Promise<T>(async resolve => fn(resolve)).then(data => {
			this.set(key, data, beforeWriteCallback);

			return data;
		});

		this.set(key, cachePromise);

		return cachePromise;
	}
}
