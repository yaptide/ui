import { YaptideEditor } from '../../js/YaptideEditor';

/**
 * Class defining the structure of all commands
 * @template execute - method to execute command, should not have any side effects
 * @template undo - method to undo command, should not have any side effects
 * @template toJSON - method to serialize command to JSON to be stored in local storage or to be saved to the file
 * @template fromJSON - method to deserialize command from JSON to restore history
 */
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
		editor: YaptideEditor,
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

//-----------------------------------------UtilityTypes-----------------------------------------//
/**
 * Utility type to get arguments of a method from a target. If method is not found, returns never
 * @template T - target type
 * @template K - method name
 */
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
//----------------------------------------------------------------------------------------------//
