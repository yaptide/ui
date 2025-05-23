import { Command } from '../Command';

/**
 * @param editor Editor
 * @param cmdArray array containing command objects
 * @constructor
 */
class MultiCmdsCommand extends Command {
	constructor(editor, cmdArray) {
		super(editor);

		this.type = 'MultiCmdsCommand';
		this.name = 'Multiple Changes';

		this.cmdArray = cmdArray !== undefined ? cmdArray : [];
	}

	execute() {
		this.editor.signals.sceneGraphChanged.active = false;

		for (let i = 0; i < this.cmdArray.length; i++) {
			this.cmdArray[i].execute();
		}

		this.editor.signals.sceneGraphChanged.active = true;
		this.editor.signals.sceneGraphChanged.dispatch();
	}

	undo() {
		this.editor.signals.sceneGraphChanged.active = false;

		for (let i = this.cmdArray.length - 1; i >= 0; i--) {
			this.cmdArray[i].undo();
		}

		this.editor.signals.sceneGraphChanged.active = true;
		this.editor.signals.sceneGraphChanged.dispatch();
	}

	toSerialized() {
		const output = super.toSerialized(this);

		const cmds = [];

		for (let i = 0; i < this.cmdArray.length; i++) {
			cmds.push(this.cmdArray[i].toSerialized());
		}

		output.cmds = cmds;

		return output;
	}

	fromSerialized(json) {
		super.fromSerialized(json);

		const cmds = json.cmds;

		for (let i = 0; i < cmds.length; i++) {
			const cmd = new window[cmds[i].type](); // creates a new object of type "json.type"
			cmd.fromSerialized(cmds[i]);
			this.cmdArray.push(cmd);
		}
	}
}

export { MultiCmdsCommand };
