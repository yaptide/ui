import { useRef } from 'react';

import { usePythonConverter } from '../PythonConverter/PythonConverterService';
import { SimulationContext } from '../types/SimulationService';
import Geant4WorkersSimulationService from './Geant4WorkersSimulationService';
import { createGenericContext, GenericContextProviderProps } from './GenericContext';

const [useGeant4WorkersSimulation, InternalGeant4WorkersSimulationContextProvider] =
	createGenericContext<SimulationContext>();

function Geant4WorkersSimulationContextProvider({ children }: GenericContextProviderProps) {
	const { convertJSON } = usePythonConverter();

	const simulationServiceRef = useRef<Geant4WorkersSimulationService>(
		new Geant4WorkersSimulationService(convertJSON)
	);

	return (
		<InternalGeant4WorkersSimulationContextProvider
			value={{
				// `bind()` is required, otherwise `this` is undefined when calling the function
				postJobDirect: simulationServiceRef.current.postJob.bind(
					simulationServiceRef.current
				),
				postJobBatch: simulationServiceRef.current.postJob.bind(
					simulationServiceRef.current
				),
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
		</InternalGeant4WorkersSimulationContextProvider>
	);
}

export { Geant4WorkersSimulationContextProvider, useGeant4WorkersSimulation };
