import { Dispatch, MutableRefObject, SetStateAction, useRef, useState } from 'react';

import { YaptideEditor } from '../ThreeEditor/js/YaptideEditor';
import { createGenericContext, GenericContextProviderProps } from './GenericContext';
import { FullSimulationData } from './ShSimulatorService';

export interface StoreContext {
	editorRef: MutableRefObject<YaptideEditor | undefined>;
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

	const value: StoreContext = {
		editorRef,
		resultsSimulationData,
		setResultsSimulationData,
		localResultsSimulationData,
		setLocalResultsSimulationData
	};

	return <StoreContextProvider value={value}>{children}</StoreContextProvider>;
};

export { Store, useStore };
