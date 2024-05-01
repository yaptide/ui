	import * as fs from 'fs';

	import { FullSimulationData, recreateRefsInResults } from '../../services/ShSimulatorService';
	import { SimulatorExamples, SimulatorType } from '../../types/RequestTypes';

	// let canImport = true;
	// let iterator = 1;
	// const EXAMPLES: Record<SimulatorType, FullSimulationData[]> = Object.values(SimulatorType).reduce((acc, type) => {
	// 	acc[type] = [];

	// 	return acc;
	// }, {} as Record<SimulatorType, FullSimulationData[]>);

	// while (canImport) {
	// 	try {
	// 		const example: FullSimulationData = require(`./ex${iterator}.json`);

	// 		if (example.input.inputJson?.project.title.length === 0)
	// 			example.input.inputJson.project.title = `Untitled example ${iterator}`;

	// 		if (example.input.inputJson && Object.values(SimulatorType).includes(example.input.inputJson.project.simulator)) {
	// 			EXAMPLES[example.input.inputJson.project.simulator].push(example);
	// 			iterator++;
	// 		}	
	// 	} catch (e) {
	// 		canImport = false;
	// 	}
	// }

	// for (const simType of Object.values(SimulatorType)) {
	// 	for (const example of EXAMPLES[simType]) {
	// 		if (example?.input.inputJson)
	// 			example.estimators = recreateRefsInResults(example.input.inputJson, example.estimators);
	// 	}
	// }

	// export default EXAMPLES;

	type SimulationMap = Record<SimulatorType, SimulatorExamples>;

	const EXAMPLES: SimulationMap = require(`./exampleMap.json`);

	// EXAMPLES[SimulatorType.SHIELDHIT].array.forEach(element => {
	// 	console.log("hi")
	// });
	console.log(EXAMPLES[SimulatorType.SHIELDHIT]);

	Object.entries(EXAMPLES[SimulatorType.SHIELDHIT]).forEach(([name, filename]) => {
        console.log(`Example Name: ${name}, Filename: ${filename}`);
    });

	console.log(EXAMPLES[SimulatorType.SHIELDHIT].type);

	export default EXAMPLES;
