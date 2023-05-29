/**
 * @typedef {import('./YaptideEditor.js').YaptideEditor} Editor
 * @typedef {import('../Simulation/Base/SimulationElement').SimulationElement} SimulationElement
 * @typedef  {Object} Command
 * @property {number} id
 * @property {boolean} inMemory
 * @property {boolean} updatable
 * @property {string} type
 * @property {string} name
 * @property {Editor} editor
 * @property {SimulationElement} [object]
 *
 */
export class Command {
	id;
	inMemory;
	updatable;
	type;
	name;
	editor;
	object;

	/**
	 * @param {Editor} editor
	 */
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
	 * }&{
	 * 		[key: string]: any
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
