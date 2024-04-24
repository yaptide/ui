	import { FullSimulationData, recreateRefsInResults } from '../../services/ShSimulatorService';
	import { SimulatorType } from '../../types/RequestTypes';

	let canImport = true;
	let iterator = 1;
	const EXAMPLES: Record<SimulatorType, FullSimulationData[]> = Object.values(SimulatorType).reduce((acc, type) => {
		acc[type] = [];

		return acc;
	}, {} as Record<SimulatorType, FullSimulationData[]>);

	while (canImport) {
		try {
			const example: FullSimulationData = require(`./ex${iterator}.json`);

			if (example.input.inputJson?.project.title.length === 0)
				example.input.inputJson.project.title = `Untitled example ${iterator}`;

			if (example.input.inputJson && Object.values(SimulatorType).includes(example.input.inputJson.project.simulator)) {
				EXAMPLES[example.input.inputJson.project.simulator].push(example);
				iterator++;
			}	
		} catch (e) {
			canImport = false;
		}
	}

	for (const simType of Object.values(SimulatorType)) {
		for (const example of EXAMPLES[simType]) {
			if (example?.input.inputJson)
				example.estimators = recreateRefsInResults(example.input.inputJson, example.estimators);
		}
	}

	export default EXAMPLES;
