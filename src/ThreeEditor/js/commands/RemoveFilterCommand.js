import { DetectFilter } from '../../util/Detect/DetectFilter';

/**
 * @param editor Editor
 * @param filter DetectFilter
 * @constructor
 */
export class RemoveFilterCommand {
	constructor(editor, filter) {
		this.editor = editor;
		this.filter = filter;

		this.object = filter;
	}

	execute() {
		this.editor.detectManager.removeFilter(this.filter);
		this.editor.deselect();
	}

	undo() {
		this.editor.detectManager.addFilter(this.filter);
		this.editor.select(this.filter);
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
