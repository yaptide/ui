import { ReactNode, useRef, useState } from 'react';
import { Editor } from '../ThreeEditor/js/Editor';
import { createGenericContext } from './GenericContext';
import { FullSimulationData } from './ShSimulatorService';

export interface StoreProps {
	children: ReactNode;
}

export interface StoreContext {
	editorRef: React.MutableRefObject<Editor | undefined>;
	resultsSimulationData?: FullSimulationData;
	setResultsSimulationData: React.Dispatch<React.SetStateAction<FullSimulationData | undefined>>;
	localResultsSimulationData?: FullSimulationData[];
	setLocalResultsSimulationData: React.Dispatch<React.SetStateAction<FullSimulationData[]>>;
}

const [useStore, StoreContextProvider] = createGenericContext<StoreContext>();

const Store = (props: StoreProps) => {
	const editorRef = useRef<Editor>();
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

	return <StoreContextProvider value={value}>{props.children}</StoreContextProvider>;
};

export { useStore, Store };
