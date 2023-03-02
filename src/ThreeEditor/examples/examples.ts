import { recreateRefsInResults } from '../../services/ShSimulatorService';
import { JobStatusData, StatusState } from '../../services/ResponseTypes';

let canImport = true;
let iterator = 1;
const EXAMPLES: JobStatusData<StatusState.COMPLETED>[] = [];
while (canImport) {
	try {
		const example: JobStatusData<StatusState.COMPLETED> = require(`./ex${iterator}.json`);
		if (
			example.inputJson &&
			example.inputJson.project.title &&
			example.inputJson.project.title.length === 0
		)
			example.inputJson.project.title = `Untitled example ${iterator}`;

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
