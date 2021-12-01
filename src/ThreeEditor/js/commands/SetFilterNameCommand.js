import { Command } from '../Command.js';
import { DetectFilter } from '../../util/Detect/DetectFilter';

/**
 * @param editor Editor
 * @param filter DetectFilter
 * @param newName string
 * @constructor
 */
export class SetFilterNameCommand extends Command {
	constructor(editor, filter, newName) {
		super(editor);

		this.type = 'SetFilterNameCommand';
		this.name = 'Set Filter Name';
		this.updatable = true;

		this.object = filter;

		this.filter = filter;
		this.oldData = filter.toJSON();
		this.newName = newName;
		this.oldName = filter.name;
	}

	execute() {
		this.filter.name = this.newName;
	}

	undo() {
		this.filter.name = this.oldName;
	}

	update(command) {
		this.newName = command.newName;
	}

	toJSON() {
		const output = super.toJSON(this);
		output.filter = this.filter.toJSON();
		output.newName = this.newName;
		output.oldName = this.oldName;
		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);
		this.filter =
			this.editor.detectManager.getFilterByUuid(json.filter.uuid) ??
			DetectFilter.fromJSON(json.filter);
		this.newName = json.newName;
		this.oldName = json.oldName;
	}
}
