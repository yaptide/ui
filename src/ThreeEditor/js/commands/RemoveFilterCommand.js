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
		this.editor.detectorManager.removeFilter(this.object);
		this.editor.deselect();
	}

	undo() {
		this.editor.detectorManager.addFilter(this.object);
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
			this.editor.detectorManager.getFilterByUuid(json.object.uuid) ??
			this.editor.detectorManager.createFilter().fromJSON(json.object);
	}
}
