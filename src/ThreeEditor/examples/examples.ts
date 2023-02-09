import {
	FinalSimulationStatusData,
	recreateRefsInResults	
} from '../../services/ShSimulatorService';

let canImport = true;
let iterator = 1;
const EXAMPLES: FinalSimulationStatusData[] = [];
while (canImport) {
	try {
		const example = require(`./ex${iterator}.json`);
		if (!(example.editor.project.title && example.editor.project.title.length > 0))
			example.editor.project.title = `Untitled example ${iterator}`;

		EXAMPLES.push(example);
		iterator++;
	} catch (e) {
		canImport = false;
	}
}

for (const example of EXAMPLES) {
	recreateRefsInResults(example);
}

export default EXAMPLES;
