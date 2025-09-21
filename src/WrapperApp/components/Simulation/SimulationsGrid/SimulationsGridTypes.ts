import { ResultsSimulationDataWithSource } from '../../../../services/StoreService';
import { YaptideEditor } from '../../../../ThreeEditor/js/YaptideEditor';
import {
	JobInputs,
	RequestGetJobInputs,
	RequestGetPageContents,
	RequestParam,
	SimulatorType
} from '../../../../types/RequestTypes';
import {
	JobStatusData,
	JobUnknownStatus,
	ResponseGetPageContents,
	SimulationInfo,
	SimulationInputFiles,
	StatusState
} from '../../../../types/ResponseTypes';
import { FullSimulationData } from '../../../../types/SimulationService';
import { PageNavigationProps, PageParamProps } from '../SimulationPanelBar';

export interface SimulationConfig {
	demoMode: boolean;
	controller: AbortController;
	trackedId: string | undefined;
	isBackendAlive: boolean;
	setBackendAlive: React.Dispatch<React.SetStateAction<boolean>>;
	statusStates: StatusState[];
}

export interface SimulationsGridProps {
	goToResults?: () => void;
	setInputFiles: (inputFiles: SimulationInputFiles | undefined) => void;
	setShowInputFilesEditor: (show: boolean) => void;
	simulator: SimulatorType;
}

export interface SimulationHandlers {
	getPageContents: (...args: RequestGetPageContents) => Promise<ResponseGetPageContents>;
	getPageStatus: (
		simulations: JobStatusData[],
		isFullData: boolean,
		handleBeforeCacheWrite: (id: string, response: JobStatusData) => void,
		signal: AbortSignal
	) => Promise<JobStatusData[] | undefined>;
	getJobStatus: (
		info: JobStatusData,
		isFullData: boolean,
		handleBeforeCacheWrite: (id: string, response: JobStatusData) => void,
		signal: AbortSignal
	) => Promise<JobStatusData | undefined>;
	getJobInputs: (...args: RequestGetJobInputs) => Promise<JobInputs | undefined>;
	getFullSimulationData: (
		jobStatus: JobStatusData,
		signal?: AbortSignal,
		cache?: boolean
	) => Promise<FullSimulationData | undefined>;
	getHelloWorld: (...args: RequestParam) => Promise<unknown>;
	cancelJob: (info: SimulationInfo, signal?: AbortSignal) => Promise<unknown>;
}

export interface SimulationState {
	simulationInfo: JobStatusData[];
	simulationsStatusData: Omit<JobUnknownStatus & SimulationInfo, never>[] | undefined;
	setSimulationInfo: React.Dispatch<React.SetStateAction<JobStatusData[]>>;
	setSimulationsStatusData: React.Dispatch<React.SetStateAction<JobStatusData[] | undefined>>;
	setResultsSimulationData: React.Dispatch<
		React.SetStateAction<ResultsSimulationDataWithSource | undefined>
	>;
	setLocalResultsSimulationData: React.Dispatch<React.SetStateAction<FullSimulationData[]>>;
	goToResults?: () => void;
	setInputFiles: (inputFiles: SimulationInputFiles | undefined) => void;
	setShowInputFilesEditor: (show: boolean) => void;
	yaptideEditor?: YaptideEditor | undefined;
}

export type PageState = Omit<
	PageParamProps & PageNavigationProps,
	'handlePageChange' | 'handleOrderChange'
>;
