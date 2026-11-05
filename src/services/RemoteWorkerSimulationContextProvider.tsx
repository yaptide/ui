import { useEffect, useMemo, useRef, useState } from 'react';

import { useConfig } from '../config/ConfigService';
import { StatusState } from '../types/ResponseTypes';
import { SimulationContext } from '../types/SimulationService';
import { useAuth } from './AuthService';
import { createGenericContext, GenericContextProviderProps } from './GenericContext';
import RemoteWorkerSimulationService from './RemoteWorkerSimulationService';
import { usePartialResultsWatch } from './usePartialResultsWatch';
import { StreamedStatus, useSimulationStatusStream } from './useSimulationStatusStream';

const FINAL_STATES = new Set([StatusState.COMPLETED, StatusState.FAILED, StatusState.CANCELED]);

const [useRemoteWorkerSimulation, InnerRemoteWorkerSimulationContextProvider] =
	createGenericContext<SimulationContext>();

function RemoteWorkerSimulationContextProvider({ children }: GenericContextProviderProps) {
	const { authKy, user } = useAuth();
	const { demoMode, backendUrl } = useConfig();
	const statusStream = useSimulationStatusStream(
		// another user logging in gets a stream of their own
		demoMode ? undefined : user?.username
	);
	// the user's unfinished simulations, and the one on screen: their partial results are merged while the app is open
	const [shownJobId, setShownJobId] = useState<string | undefined>();
	const watchedJobIds = useMemo(() => {
		if (demoMode || !user) return [];
		const unfinished = Object.values(statusStream.statuses)
			.filter((status: StreamedStatus) => !FINAL_STATES.has(status.jobState as StatusState))
			.map(status => status.jobId);

		return shownJobId ? [...unfinished, shownJobId] : unfinished;
	}, [demoMode, user, statusStream.statuses, shownJobId]);
	const partialWatch = usePartialResultsWatch(authKy, backendUrl, watchedJobIds);

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
			getEstimatorsItems: service.getEstimatorsItems.bind(service),
			getJobLogs: service.getJobLogs.bind(service),
			getFullSimulationData: service.getFullSimulationData.bind(service)
		};
	}, []);

	const value = useMemo(
		() => ({ ...handlers, statusStream, partialWatch, setShownJobId }),
		[handlers, statusStream, partialWatch]
	);

	return (
		<InnerRemoteWorkerSimulationContextProvider value={value}>
			{children}
		</InnerRemoteWorkerSimulationContextProvider>
	);
}

export { RemoteWorkerSimulationContextProvider, useRemoteWorkerSimulation };
