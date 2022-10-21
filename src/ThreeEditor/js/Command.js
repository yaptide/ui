/**
 * @param editor pointer to main editor object used to initialize
 *        each command object with a reference to the editor
 * @constructor
 */

export class Command {
	constructor(editor) {
		this.id = -1;
		this.inMemory = false;
		this.updatable = false;
		this.type = '';
		this.name = '';
		this.editor = editor;
	}

	/**
	 * @returns {{
	 * 		type: string,
	 * 		id: number,
	 * 		name: string,
	 * 		object?: Object
	 * }}
	 */
	toJSON() {
		const output = {};
		output.type = this.type;
		output.id = this.id;
		output.name = this.name;
		return output;
	}

	fromJSON(json) {
		this.inMemory = true;
		this.type = json.type;
		this.id = json.id;
		this.name = json.name;
	}
}