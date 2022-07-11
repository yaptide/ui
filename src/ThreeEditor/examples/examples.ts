import { SimulationStatusData } from "../../services/ShSimulatorService";

export interface EditorExample {
	editor: unknown;
	result: SimulationStatusData;
}

let canImport = true;
let iterator = 1;
const EXAMPLES: EditorExample[] = [];
while (canImport) {
	try {
		const editor = require(`./ex${iterator}.json`);
		const result = require(`./ex${iterator}_result.json`);
		editor.result = result;
		if (!(editor.project?.title && editor.project.title.length > 0))
			editor.project.title = `Untitled example ${iterator}`;
		EXAMPLES.push({ editor, result });
		iterator++;
	} catch (e) {
		canImport = false;
	}
}

export default EXAMPLES;
