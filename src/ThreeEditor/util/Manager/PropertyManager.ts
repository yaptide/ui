import { Editor } from '../../js/Editor';

export class PropertyManager<T> {
	private _value: T;
	private readonly _defaultValue: T;
	private readonly valueHandlers: ((value: T) => void)[] = [];
	editor: Editor;

	constructor(editor: Editor, value: T) {
		this.editor = editor;
		this._value = value;
		this._defaultValue = value;
	}

	reset() {
		this._value = this._defaultValue;
		this.valueHandlers.forEach(handler => handler(this._value));
	}

	set currentValue(value: T) {
		if (this._value !== value) {
			this._value = value;
			this.valueHandlers.forEach(handler => handler(this._value));
		}
	}

	get currentValue(): T {
		return this._value;
	}

	addPropertyChangedListener(listener: (value: T) => void): void {
		this.valueHandlers.push(listener);
	}
}
