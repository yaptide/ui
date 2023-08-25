import type { YaptideEditor } from './YaptideEditor';

/**
 * @typedef {import('../Simulation/Base/SimulationElement').SimulationElement} SimulationElement
 * @typedef  {Object} Command
 * @property {number} id
 * @property {boolean} inMemory
 * @property {boolean} updatable
 * @property {string} type
 * @property {string} name
 * @property {YaptideEditor} editor
 * @property {SimulationElement} [object]
 *
 */
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

	/**
	 * @returns {{
	 * 		type: string,
	 * 		id: number,
	 * 		name: string
	 * }&{
	 * 		[key: string]: any
	 * }}
	 */
	toJSON() {
		const output: CommandJSON = {
			type: this.type,
			id: this.id,
			name: this.name
		};

		return output;
	}

	fromJSON(json: CommandJSON) {
		this.inMemory = true;
		this.type = json.type;
		this.id = json.id;
		this.name = json.name;
	}
}
