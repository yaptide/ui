import { Command } from '../Command.js';

/**
 * @param editor Editor
 * @param filter DetectFilter
 * @param newName string
 * @constructor
 */
export class SetFilterNameCommand extends Command {
	constructor(editor, object, newName) {
		super(editor);

		this.type = 'SetFilterNameCommand';
		this.name = 'Set Filter Name';
		this.updatable = true;

		this.object = object;
		this.oldData = object.toJSON();
		this.newName = newName;
		this.oldName = object.name;
	}

	execute() {
		this.object.name = this.newName;
	}

	undo() {
		this.object.name = this.oldName;
	}

	update(command) {
		this.newName = command.newName;
	}

	toJSON() {
		const output = super.toJSON(this);
		output.object = this.object.toJSON();
		output.newName = this.newName;
		output.oldName = this.oldName;

		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);
		this.object =
			this.editor.detectorManager.getFilterByUuid(json.object.uuid) ??
			this.editor.detectorManager.createFilter().fromJSON(json.object);
		this.newName = json.newName;
		this.oldName = json.oldName;
	}
}
