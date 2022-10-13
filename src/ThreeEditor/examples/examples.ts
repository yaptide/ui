import {
	FinalSimulationStatusData,
	recreateRefsInResults,
	SimulationStatusData
} from '../../services/ShSimulatorService';
import { EditorJson } from '../js/EditorJson';

let canImport = true;
let iterator = 1;
const EXAMPLES: FinalSimulationStatusData[] = [];
while (canImport) {
	try {
		const example = require(`./ex${iterator}.json`);
		if (!(example.editor.project.title && example.editor.project.title.length > 0))
			example.editor.project.title = `Untitled example ${iterator}`;

		recreateRefsInResults(example);

		EXAMPLES.push(example);
		iterator++;
	} catch (e) {
		canImport = false;
	}
}

export default EXAMPLES;
