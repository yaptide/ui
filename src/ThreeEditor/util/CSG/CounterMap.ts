import { Editor } from '../../js/Editor';

export class CounterMap<K extends string> {
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

		if (!lastCount) throw Error(`No item to decrement for key: ${key}`);
		const newValue = lastCount - 1;
		newValue > 0 ? this.map.set(key, newValue) : this.map.delete(key);
		return newValue;
	}

	get(key: K) {
		return this.map.get(key);
	}

	has(key: K) {
		return (this.map.get(key) ?? 0) > 0;
	}

	toJSON(): { [k in K]: number } {
		return Object.fromEntries(this.map) as { [k in K]: number };
	}

	fromJSON(json: { [k in K]: number }) {
		for (const key in json) {
			this.map.set(key, json[key]);
		}
		return this;
	}
	clear() {
		this.map.clear();
	}
}
