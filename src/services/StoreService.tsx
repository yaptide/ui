import { ReactNode, useRef, useState } from 'react';
import { Editor } from '../ThreeEditor/js/Editor';
import { createGenericContext } from '../util/GenericContext';
import { JobStatusData, StatusState } from './ResponseTypes';

export interface StoreProps {
	children: ReactNode;
}

export interface IStore {
	editorRef: React.MutableRefObject<Editor | undefined>;
	resultsSimulationData?: JobStatusData<StatusState.COMPLETED>;
	setResultsSimulationData: React.Dispatch<
		React.SetStateAction<JobStatusData<StatusState.COMPLETED> | undefined>
	>;
	localResultsSimulationData?: JobStatusData<StatusState.LOCAL>[];
	setLocalResultsSimulationData: React.Dispatch<
		React.SetStateAction<JobStatusData<StatusState.LOCAL>[]>
	>;
}

const [useStore, StoreContextProvider] = createGenericContext<IStore>();

const Store = (props: StoreProps) => {
	const editorRef = useRef<Editor>();
	const [resultsSimulationData, setResultsSimulationData] =
		useState<JobStatusData<StatusState.COMPLETED>>();
	const [localResultsSimulationData, setLocalResultsSimulationData] = useState<
		JobStatusData<StatusState.LOCAL>[]
	>([]);

	const value: IStore = {
		editorRef,
		resultsSimulationData,
		setResultsSimulationData,
		localResultsSimulationData,
		setLocalResultsSimulationData
	};

	return <StoreContextProvider value={value}>{props.children}</StoreContextProvider>;
};

export { useStore, Store };
