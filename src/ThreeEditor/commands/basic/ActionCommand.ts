import { BaseCommandJSON, Command, MethodArgs } from './AbstractCommand';
import { YaptideEditor } from '../../js/YaptideEditor';

/**
 * ActionCommand is a command that executes a method on a target
 * and undoes it by executing another method on the same target
 *
 * Method and undoMethod must perform opposite actions with the same arguments
 */
export class ActionCommand<
	Target extends Record<string, unknown> & Record<Method, (...args: any[]) => unknown>,
	Method extends keyof Target,
	UndoMethod extends keyof Target,
	Args extends MethodArgs<Target, Method>
> extends Command<Target> {
	method: Method;
	undoMethod: UndoMethod;
	args: Args;
	constructor(
		editor: YaptideEditor,
		target: Target,
		name: string,
		method: Method,
		undoMethod: UndoMethod,
		args: Args,
		id = -1,
		updatable = false
	) {
		super(editor, target, 'ActionCommand', name, id, updatable);
		this.method = method;
		this.undoMethod = undoMethod;
		this.args = args;
	}

	execute() {
		this.target[this.method](...this.args);
	}

	undo() {
		this.target[this.undoMethod](...this.args);
	}

	toJSON(): ActionCommandJSON<Target, Method, UndoMethod, Args> {
		const data = { method: this.method, undoMethod: this.undoMethod, args: this.args };
		return { ...super.toJSON(), data };
	}

	fromJSON(json: ActionCommandJSON<Target, Method, UndoMethod, Args>): void {
		super.fromJSON(json);
		const { method, undoMethod, args } = json.data;
		this.method = method;
		this.undoMethod = undoMethod;
		this.args = args;
	}
}

//-----------------------------------------UtilityTypes-----------------------------------------//
type ActionCommandJSON<
	Target extends Record<string, unknown>,
	Key extends keyof Target,
	UndoMethod extends keyof Target,
	Args extends MethodArgs<Target, Key>
> = BaseCommandJSON<Target> & {
	data: {
		method: Key;
		undoMethod: UndoMethod;
		args: Args;
	};
};
//----------------------------------------------------------------------------------------------//
