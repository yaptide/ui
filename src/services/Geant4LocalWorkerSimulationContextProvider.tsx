import { useRef } from 'react';

import { usePythonConverter } from '../PythonConverter/PythonConverterService';
import { SimulationContext } from '../types/SimulationService';
import Geant4LocalWorkerSimulationService from './Geant4LocalWorkerSimulationService';
import { createGenericContext, GenericContextProviderProps } from './GenericContext';

const [useGeant4LocalWorkerSimulation, InnerGeant4LocalWorkerSimulationContextProvider] =
	createGenericContext<SimulationContext>();

function Geant4LocalWorkerSimulationContextProvider({ children }: GenericContextProviderProps) {
	const { convertJSON } = usePythonConverter();

	const simulationServiceRef = useRef<Geant4LocalWorkerSimulationService>(
		new Geant4LocalWorkerSimulationService(convertJSON)
	);

	return (
		<InnerGeant4LocalWorkerSimulationContextProvider
			value={{
				// `bind()` is required, otherwise `this` is undefined when calling the function
				postJob: simulationServiceRef.current.postJob.bind(simulationServiceRef.current),
				cancelJob: simulationServiceRef.current.cancelJob.bind(
					simulationServiceRef.current
				),
				getHelloWorld: simulationServiceRef.current.helloWorld.bind(
					simulationServiceRef.current
				),
				getJobStatus: simulationServiceRef.current.getJobStatus.bind(
					simulationServiceRef.current
				),
				getPageContents: simulationServiceRef.current.getPageContents.bind(
					simulationServiceRef.current
				),
				getPageStatus: simulationServiceRef.current.getPageStatus.bind(
					simulationServiceRef.current
				),
				getJobInputs: simulationServiceRef.current.getJobInputs.bind(
					simulationServiceRef.current
				),
				getJobResults: simulationServiceRef.current.getJobResults.bind(
					simulationServiceRef.current
				),
				getEstimatorsPages: simulationServiceRef.current.getEstimatorsPages.bind(
					simulationServiceRef.current
				),
				getJobLogs: simulationServiceRef.current.getJobLogs.bind(
					simulationServiceRef.current
				),
				// @ts-ignore
				getFullSimulationData: simulationServiceRef.current.getFullSimulationData.bind(
					simulationServiceRef.current
				)
			}}>
			{children}
		</InnerGeant4LocalWorkerSimulationContextProvider>
	);
}

export { Geant4LocalWorkerSimulationContextProvider, useGeant4LocalWorkerSimulation };
