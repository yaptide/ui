import { Command } from '../Command.js';

/**
 * @param editor Editor
 * @param filter DetectFilter
 * @constructor
 * @deprecated Use ObjectManagementFactory to create adder commands
 */
export class AddFilterCommand extends Command {
	constructor(editor, object) {
		super(editor);

		this.type = 'AddFilterCommand';

		this.object = object;
		this.name = object ? `Add Filter: ${object.name}` : `Create Filter`;
	}

	execute() {
		if (this.object) this.editor.detectorManager.addFilter(this.object);
		else this.object = this.editor.detectorManager.createFilter();

		this.editor.select(this.object);
	}

	undo() {
		this.editor.detectorManager.removeFilter(this.object);
		this.editor.deselect();
	}

	toJSON() {
		const output = super.toJSON(this);
		output.object = this.object.toJSON();
		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);
		this.object =
			this.editor.detectorManager.getFilterByUuid(json.object.uuid) ??
			this.editor.detectorManager.createFilter().fromJSON(json.object);
	}
}
