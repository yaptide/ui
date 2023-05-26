import { Editor } from '../../js/Editor';

export type MethodArgs<T extends Record<string, unknown>, K extends keyof T> = T[K] extends (
	...args: any[]
) => unknown
	? Parameters<T[K]>
	: never;

export type BaseCommandJSON<Target extends Record<string, unknown>> = {
	type: string;
	id: number;
	name: string;
	target: Target;
	data: Record<string, unknown>;
};

export abstract class Command<Target extends Record<string, unknown> = Record<string, unknown>> {
	editor;
	target;
	private _type: string;
	get type() {
		return this._type;
	}
	name;
	id;
	readonly updatable;
	inMemory;

	constructor(
		editor: Editor,
		target: Target,
		type: string,
		name: string,
		id: number = -1,
		updatable = false
	) {
		this.editor = editor;
		this.target = target;
		this._type = type;
		this.name = name;
		this.id = id;
		this.updatable = updatable;
		this.inMemory = true;
	}

	abstract execute(): void;
	abstract undo(): void;
	toJSON(): BaseCommandJSON<Target> {
		return {
			type: this.type,
			id: this.id,
			name: this.name,
			target: this.target,
			data: {}
		};
	}
	fromJSON(json: BaseCommandJSON<Target>): void {
		this._type = json.type;
		this.id = json.id;
		this.name = json.name;
		this.target = json.target;
	}
}
