import { useEffect, useRef } from 'react';

import { RequestGetJobStatus, RequestPostJob } from '../types/RequestTypes';
import { SimulationContext } from '../types/SimulationService';
import { useAuth } from './AuthService';
import { createGenericContext, GenericContextProviderProps } from './GenericContext';
import RestSimulationService, { getEndpointFromSimulationInfo } from './RestSimulationService';

const [useRestSimulation, ShSimulationContextProvider] = createGenericContext<SimulationContext>();

function RestSimulationContextProvider({ children }: GenericContextProviderProps) {
	const { authKy } = useAuth();
	const simulationServiceRef = useRef<RestSimulationService>(new RestSimulationService(authKy));

	useEffect(() => {
		simulationServiceRef.current.authKy = authKy;
	}, [authKy]);

	return (
		<ShSimulationContextProvider
			value={{
				postJobDirect: async (...args: RequestPostJob) => {
					simulationServiceRef.current.setEndPoint('jobs/direct');

					return simulationServiceRef.current.postJob(...args);
				},
				postJobBatch: async (...args: RequestPostJob) => {
					simulationServiceRef.current.setEndPoint('jobs/batch');

					return simulationServiceRef.current.postJob(...args);
				},
				// `bind()` is required, otherwise `this` is undefined when calling the function
				cancelJob: simulationServiceRef.current.cancelJob.bind(
					simulationServiceRef.current
				),
				getHelloWorld: simulationServiceRef.current.helloWorld.bind(
					simulationServiceRef.current
				),
				getJobStatus: async (...args: RequestGetJobStatus) => {
					// TODO: sth less stupid
					const oldEndPoint = simulationServiceRef.current.endPoint;
					simulationServiceRef.current.setEndPoint(
						getEndpointFromSimulationInfo(args[0])
					);
					let result = simulationServiceRef.current.getJobStatus(...args);
					simulationServiceRef.current.setEndPoint(oldEndPoint);

					return await result;
				},
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
		</ShSimulationContextProvider>
	);
}

export { RestSimulationContextProvider,useRestSimulation };
