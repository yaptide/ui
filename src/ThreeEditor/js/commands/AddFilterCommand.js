import { Command } from '../Command.js';
import { DetectFilter } from '../../util/Detect/DetectFilter';

/**
 * @param editor Editor
 * @param filter DetectFilter
 * @constructor
 */
export class AddFilterCommand extends Command {
	constructor(editor, object) {
		super(editor);

		this.type = 'AddFilterCommand';

		this.object = object;
		this.name = object ? `Add Filter: ${object.name}` : `Create Filter`;
	}

	execute() {
		if (this.object) this.editor.detectManager.addFilter(this.object);
		else this.object = this.editor.detectManager.createFilter();

		this.editor.select(this.object);
	}

	undo() {
		this.editor.detectManager.removeFilter(this.object);
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
			this.editor.detectManager.getFilterByUuid(json.object.uuid) ??
			this.editor.detectManager.createFilter().fromJSON(json.object);
	}
}
