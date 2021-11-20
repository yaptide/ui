import { Command } from '../Command.js';
import DetectFilter from '../../util/Detect/DetectFilter';

/**
 * @param editor Editor
 * @param filter DetectFilter
 * @constructor
 */
export class RemoveFilterCommand {
	constructor(editor, filter) {
		this.editor = editor;
		this.filter = filter;
	}

	execute() {
		this.editor.removeFilter(this.filter);
	}

	undo() {
		this.editor.addFilter(this.filter);
	}

	toJSON() {
		const output = super.toJSON(this);
		output.filter = this.filter.toJSON();
		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);
		this.filter =
			this.editor.detectManager.getFilterByUuid(json.filter.uuid) ??
			DetectFilter.fromJSON(json.filter);
	}
}
