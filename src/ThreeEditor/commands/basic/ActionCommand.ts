import { YaptideEditor } from '../../js/YaptideEditor';
import { BaseCommandJSON, Command, MethodArgs } from './AbstractCommand';

/**
 * ActionCommand is a command that executes a method on a target
 * and undoes it by executing another method on the same target
 *
 * Method and undoMethod must perform opposite actions with the same arguments
 */
export class ActionCommand<
	Target extends Record<Method, (...args: any[]) => unknown>,
	Method extends keyof Target,
	UndoMethod extends keyof Target,
	Args extends MethodArgs<Target, Method>
> extends Command<Target> {
	method: Method;
	undoMethod: UndoMethod;
	args: Args;
	undoArgs: Args;
	constructor(
		editor: YaptideEditor,
		target: Target,
		name: string,
		method: Method,
		undoMethod: UndoMethod,
		args: Args,
		undoArgs: Args = args,
		id = -1,
		updatable = false
	) {
		super(editor, target, 'ActionCommand', name, id, updatable);
		this.method = method;
		this.undoMethod = undoMethod;
		this.args = args;
		this.undoArgs = undoArgs;
	}

	execute() {
		this.target[this.method](...this.args);
	}

	undo() {
		this.target[this.undoMethod](...this.undoArgs);
	}

	toJSON(): ActionCommandJSON<Target, Method, UndoMethod, Args> {
		const data = {
			method: this.method,
			undoMethod: this.undoMethod,
			args: this.args,
			undoArgs: this.undoArgs
		};

		return { ...super.toJSON(), data };
	}

	fromJSON(json: ActionCommandJSON<Target, Method, UndoMethod, Args>): void {
		super.fromJSON(json);
		const { method, undoMethod, args } = json.data;
		this.method = method;
		this.undoMethod = undoMethod;
		this.args = args;
		this.undoArgs = args;
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
		undoArgs: Args;
	};
};
//----------------------------------------------------------------------------------------------//
