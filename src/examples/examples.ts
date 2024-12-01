import { useLoader } from '../services/LoaderService';
import { FullSimulationData } from '../services/ShSimulatorService';
import { SimulatorExamples, SimulatorType } from '../types/RequestTypes';
import { StatusState } from '../types/ResponseTypes';

type SimulationMap = Record<SimulatorType, SimulatorExamples>;

const EXAMPLES: SimulationMap = require(`./exampleMap.json`);

export function useFetchExampleData() {
	const { loadFromJson } = useLoader();

	const fetchExampleData = (exampleName: string) => {
		fetch(`${process.env.PUBLIC_URL}/examples/${exampleName}`)
			.then(response => {
				if (response.status !== 200) {
					console.log('Looks like there was a problem. Status Code: ' + response.status);

					return;
				}

				response.json().then(data => {
					const simulationData: FullSimulationData = data as FullSimulationData;

					loadFromJson(
						[simulationData].map(e => ({
							...e,
							jobState: StatusState.COMPLETED
						}))
					);
				});
			})
			.catch(err => {
				console.log('Fetch Error :-S', err);
			});
	};

	return fetchExampleData;
}

export default EXAMPLES;
