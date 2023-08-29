import { YaptideEditor } from '../../js/YaptideEditor';
import { AbstractCommand, BaseCommandJSON, MethodArgs } from './AbstractCommand';

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
> extends AbstractCommand<Target> {
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
		const { method, undoMethod, args, undoArgs, target } = this;

		return { ...super.toJSON(), target, data: { method, undoMethod, args, undoArgs } };
	}

	static fromJSON<
		Target extends Record<Method, (...args: any[]) => unknown>,
		Method extends keyof Target,
		UndoMethod extends keyof Target,
		Args extends MethodArgs<Target, Method>
	>(editor: YaptideEditor, json: ActionCommandJSON<Target, Method, UndoMethod, Args>) {
		const command = new ActionCommand(
			editor,
			json.target,
			json.name,
			json.data.method,
			json.data.undoMethod,
			json.data.args,
			json.data.undoArgs,
			json.id,
			json.updatable
		);

		return command;
	}
}

//-----------------------------------------UtilityTypes-----------------------------------------//
type ActionCommandJSON<
	Target extends Record<string, unknown>,
	Key extends keyof Target,
	UndoMethod extends keyof Target,
	Args extends MethodArgs<Target, Key>
> = BaseCommandJSON & {
	target: Target;
	data: {
		method: Key;
		undoMethod: UndoMethod;
		args: Args;
		undoArgs: Args;
	};
};
//----------------------------------------------------------------------------------------------//
