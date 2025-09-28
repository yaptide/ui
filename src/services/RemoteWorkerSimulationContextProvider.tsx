import { useEffect, useRef } from 'react';

import { SimulationContext } from '../types/SimulationService';
import { useAuth } from './AuthService';
import { createGenericContext, GenericContextProviderProps } from './GenericContext';
import RemoteWorkerSimulationService from './RemoteWorkerSimulationService';

const [useRemoteWorkerSimulation, InnerRemoteWorkerSimulationContextProvider] =
	createGenericContext<SimulationContext>();

function RemoteWorkerSimulationContextProvider({ children }: GenericContextProviderProps) {
	const { authKy } = useAuth();
	const simulationServiceRef = useRef<RemoteWorkerSimulationService>(
		new RemoteWorkerSimulationService(authKy)
	);

	useEffect(() => {
		simulationServiceRef.current.authKy = authKy;
	}, [authKy]);

	return (
		<InnerRemoteWorkerSimulationContextProvider
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
		</InnerRemoteWorkerSimulationContextProvider>
	);
}

export { RemoteWorkerSimulationContextProvider, useRemoteWorkerSimulation };
