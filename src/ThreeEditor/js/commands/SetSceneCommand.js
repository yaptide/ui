import { Command } from '../Command';
import { AddObjectCommand } from './AddObjectCommand.js';
import { SetUuidCommand } from './SetUuidCommand.js';
import { SetValueCommand } from './SetValueCommand.js';

/**
 * @param editor Editor
 * @param scene containing children to import
 * @constructor
 */
class SetSceneCommand extends Command {
	constructor(editor, scene) {
		super(editor);

		this.type = 'SetSceneCommand';
		this.name = 'Set Scene';

		this.cmdArray = [];

		if (scene !== undefined) {
			this.cmdArray.push(
				new SetUuidCommand(this.editor, this.editor.figureManager, scene.uuid)
			);

			this.cmdArray.push(
				new SetValueCommand(this.editor, this.editor.figureManager, 'name', scene.name)
			);

			this.cmdArray.push(
				new SetValueCommand(
					this.editor,
					this.editor.figureManager,
					'userData',
					JSON.parse(JSON.stringify(scene.userData))
				)
			);

			while (scene.children.length > 0) {
				const child = scene.children.pop();
				this.cmdArray.push(new AddObjectCommand(this.editor, child));
			}
		}
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

export { SetSceneCommand };
