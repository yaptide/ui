import { DetectFilter } from '../../util/Detect/DetectFilter';

/**
 * @param editor Editor
 * @param filter DetectFilter
 * @constructor
 */
export class RemoveFilterCommand {
	constructor(editor, object) {
		this.editor = editor;
		this.object = object;
	}

	execute() {
		this.editor.detectManager.removeFilter(this.object);
		this.editor.deselect();
	}

	undo() {
		this.editor.detectManager.addFilter(this.object);
		this.editor.select(this.object);
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
			DetectFilter.fromJSON(json.filter);
	}
}
