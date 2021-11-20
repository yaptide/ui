import { Command } from '../Command.js';
import DetectFilter from '../../util/Detect/DetectFilter';

/**
 * @param editor Editor
 * @param filter DetectFilter
 * @constructor
 */
export class AddFilterCommand extends Command {
	constructor(editor, filter) {
		super(editor);

		this.type = 'AddFilterCommand';

		this.filter = filter;
		this.name = filter ? `Add Filter: ${filter.name}` : `Create Filter`;
	}

	execute() {
		if (this.filter) this.editor.detectManager.addFilter(this.filter);
		else this.section = this.editor.detectManager.createFilter();
	}

	undo() {
		this.editor.removeFilter(this.filter);
	}

	toJSON() {
		const output = super.toJSON(this);
		output.filter = this.filter.toJSON();
		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);
		this.filter = this.editor.detectManager.getFilterByUuid(json.filter.uuid) ?? DetectFilter.fromJSON(json.filter);
	}
}
