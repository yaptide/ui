import type { YaptideEditor } from './YaptideEditor';

export interface CommandJSON {
	type: string;
	id: number;
	name: string;
}

export class Command {
	id: number;
	inMemory: boolean;
	updatable: boolean;
	type: string;
	name: string;
	editor: YaptideEditor;

	/**
	 * @param {YaptideEditor} editor
	 */
	constructor(editor: YaptideEditor) {
		this.id = -1;
		this.inMemory = false;
		this.updatable = false;
		this.type = '';
		this.name = '';
		this.editor = editor;
	}

	toSerialized() {
		const output: CommandJSON = {
			type: this.type,
			id: this.id,
			name: this.name
		};

		return output;
	}

	fromSerialized(json: CommandJSON) {
		this.inMemory = true;
		this.type = json.type;
		this.id = json.id;
		this.name = json.name;
	}
}
