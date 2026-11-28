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
		const cachePromise: Promise<T> = new Promise<T>((resolve, reject) => {
			// a failed fetch must reject, not leave every caller waiting on this cache entry forever
			Promise.resolve(fn(resolve)).catch(reject);
		}).then(
			data => {
				this.set(key, data, beforeWriteCallback);

				return data;
			},
			error => {
				if (this.data.get(key) === cachePromise) this.delete(key);

				throw error;
			}
		);

		this.set(key, cachePromise);

		return cachePromise;
	}
}
