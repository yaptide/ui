import { Dispatch, MutableRefObject, SetStateAction, useRef, useState } from 'react';

import { YaptideEditor } from '../ThreeEditor/js/YaptideEditor';
import { createGenericContext, GenericContextProviderProps } from './GenericContext';
import { FullSimulationData } from './ShSimulatorService';

export interface StoreContext {
	editorRef: MutableRefObject<YaptideEditor | undefined>;
	trackedId?: string;
	setTrackedId: Dispatch<SetStateAction<string | undefined>>;
	resultsSimulationData?: FullSimulationData;
	setResultsSimulationData: Dispatch<SetStateAction<FullSimulationData | undefined>>;
	localResultsSimulationData?: FullSimulationData[];
	setLocalResultsSimulationData: Dispatch<SetStateAction<FullSimulationData[]>>;
}

const [useStore, StoreContextProvider] = createGenericContext<StoreContext>();

const Store = ({ children }: GenericContextProviderProps) => {
	const editorRef = useRef<YaptideEditor>();
	const [resultsSimulationData, setResultsSimulationData] = useState<FullSimulationData>();
	const [localResultsSimulationData, setLocalResultsSimulationData] = useState<
		FullSimulationData[]
	>([]);
	const [trackedId, setTrackedId] = useState<string>();

	const value: StoreContext = {
		editorRef,
		trackedId,
		setTrackedId,
		resultsSimulationData,
		setResultsSimulationData,
		localResultsSimulationData,
		setLocalResultsSimulationData
	};

	return <StoreContextProvider value={value}>{children}</StoreContextProvider>;
};

export { Store, useStore };
