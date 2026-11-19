import CacheMap from './CacheMap';

describe('CacheMap.createPromise', () => {
	test('a failed fetch rejects and leaves no entry, so the next call fetches again', async () => {
		const cache = new CacheMap<{ value: number }>();

		await expect(
			cache.createPromise(async () => {
				throw new Error('offline');
			}, 'key')
		).rejects.toThrow('offline');
		expect(cache.has('key')).toBe(false);

		const value = await cache.createPromise(async resolve => resolve({ value: 1 }), 'key');

		expect(value).toEqual({ value: 1 });
		expect(cache.get('key')).toEqual({ value: 1 });
	});
});
