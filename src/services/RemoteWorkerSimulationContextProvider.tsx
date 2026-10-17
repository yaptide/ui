import { useEffect, useMemo, useRef } from 'react';

import { useConfig } from '../config/ConfigService';
import { SimulationContext } from '../types/SimulationService';
import { useAuth } from './AuthService';
import { createGenericContext, GenericContextProviderProps } from './GenericContext';
import RemoteWorkerSimulationService from './RemoteWorkerSimulationService';
import { useSimulationStatusStream } from './useSimulationStatusStream';

const [useRemoteWorkerSimulation, InnerRemoteWorkerSimulationContextProvider] =
	createGenericContext<SimulationContext>();

function RemoteWorkerSimulationContextProvider({ children }: GenericContextProviderProps) {
	const { authKy, user } = useAuth();
	const { demoMode } = useConfig();
	const statusStream = useSimulationStatusStream(
		// another user logging in gets a stream of their own
		demoMode ? undefined : user?.username
	);

	const simulationServiceRef = useRef<RemoteWorkerSimulationService>(
		new RemoteWorkerSimulationService(authKy)
	);

	useEffect(() => {
		simulationServiceRef.current.authKy = authKy;
	}, [authKy]);

	// bound once: the stream re-renders this provider on every pushed status, and new functions would make every
	// consumer fetch again
	const handlers = useMemo(() => {
		const service = simulationServiceRef.current;

		return {
			postJob: service.postJob.bind(service),
			cancelJob: service.cancelJob.bind(service),
			getHelloWorld: service.helloWorld.bind(service),
			getJobStatus: service.getJobStatus.bind(service),
			getPageContents: service.getPageContents.bind(service),
			getPageStatus: service.getPageStatus.bind(service),
			getJobInputs: service.getJobInputs.bind(service),
			getJobResults: service.getJobResults.bind(service),
			getEstimatorsPages: service.getEstimatorsPages.bind(service),
			getJobLogs: service.getJobLogs.bind(service),
			getFullSimulationData: service.getFullSimulationData.bind(service)
		};
	}, []);
	const value = useMemo(() => ({ ...handlers, statusStream }), [handlers, statusStream]);

	return (
		<InnerRemoteWorkerSimulationContextProvider value={value}>
			{children}
		</InnerRemoteWorkerSimulationContextProvider>
	);
}

export { RemoteWorkerSimulationContextProvider, useRemoteWorkerSimulation };
