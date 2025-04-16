import { SerializableState } from '../../ThreeEditor/js/EditorJson';

export class CounterMapError<K extends string> extends Error {
	type = 'CounterMapError';

	constructor(
		message: string,
		public readonly origin: { origin: string; key: K }
	) {
		super(message);
	}
}

export const isCounterMapError = <T extends string>(
	error: unknown
): error is CounterMapError<T> => {
	return error instanceof CounterMapError;
};

export class CounterMap<K extends string> implements SerializableState<Record<string, number>> {
	private map: Map<K, number> = new Map();

	constructor(array?: Array<K>) {
		if (array) array.forEach(e => this.increment(e));
	}

	increment(key: K): number {
		const lastCount = this.map.get(key) ?? 0;
		const newValue = lastCount + 1;
		this.map.set(key, newValue);

		return newValue;
	}

	decrement(key: K): number {
		const lastCount = this.map.get(key);

		if (!lastCount)
			throw new CounterMapError(`No item to decrement for key: ${key}`, {
				origin: 'NoItemToDecrement',
				key: key
			});
		const newValue = lastCount - 1;
		this.map.set(key, newValue);

		return newValue;
	}

	get(key: K) {
		return this.map.get(key);
	}

	has(key: K) {
		return (this.map.get(key) ?? 0) > 0;
	}

	toSerialized(): Record<string, number> {
		const json: Record<string, number> = {};
		this.map.forEach((value, key) => {
			if (value > 0) json[key] = value;
		});

		return json;
	}

	fromSerialized(json: { [k in K]: number }) {
		for (const key in json) {
			this.map.set(key, json[key]);
		}

		return this;
	}

	clear() {
		this.map.clear();
	}
}
