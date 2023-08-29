import { YaptideEditor } from '../../js/YaptideEditor';

export type Command = {
	readonly updatable: boolean;
	inMemory: boolean;
	id: number;
	editor: YaptideEditor;
	name: string;
	type: string;
	execute: () => void;
	undo: () => void;
	toJSON: () => BaseCommandJSON;
};

/**
 * Class defining the structure of all commands
 * @template execute - method to execute command, should not have any side effects
 * @template undo - method to undo command, should not have any side effects
 * @template toJSON - method to serialize command to JSON to be stored in local storage or to be saved to the file
 * @template fromJSON - method to deserialize command from JSON to restore history
 */
export abstract class AbstractCommand<
	Target extends Record<string, unknown> = Record<string, unknown>
> implements Command
{
	editor;
	target;
	private _type: string;
	get type() {
		return this._type;
	}

	private _updatable: boolean;
	get updatable() {
		return this._updatable;
	}

	name;
	id;
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
		this._type = type;
		this.name = name;
		this.id = id;
		this._updatable = updatable;
		this.inMemory = true;
		this.target = target;
	}

	abstract execute(): void;
	abstract undo(): void;

	toJSON(): BaseCommandJSON {
		return {
			type: this.type,
			id: this.id,
			name: this.name,
			updatable: this._updatable,
			data: {}
		};
	}
}

//-----------------------------------------UtilityTypes-----------------------------------------//
/**
 * Utility type to get arguments of a method from a target. If method is not found, returns never
 * @template T - target type
 * @template K - method name
 */
export type MethodArgs<T, K extends keyof T> = T[K] extends (...args: any[]) => unknown
	? Parameters<T[K]>
	: never;

export type BaseCommandJSON = {
	type: string;
	id: number;
	name: string;
	data?: Record<string, unknown>;
	updatable: boolean;
};
//----------------------------------------------------------------------------------------------//
