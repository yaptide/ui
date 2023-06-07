import { FullSimulationData, recreateRefsInResults } from '../../services/ShSimulatorService';

let canImport = false;
let iterator = 1;
const EXAMPLES: FullSimulationData[] = [];
while (canImport) {
	try {
		const example: FullSimulationData = require(`./ex${iterator}.json`);
		if (example.input.inputJson?.project.title.length === 0)
			example.input.inputJson.project.title = `Untitled example ${iterator}`;

		EXAMPLES.push(example);
		iterator++;
	} catch (e) {
		canImport = false;
	}
}


for (const example of EXAMPLES) {
	if(example?.input.inputJson)
		example.estimators = recreateRefsInResults(example.input.inputJson, example.estimators);
}

export default EXAMPLES;
