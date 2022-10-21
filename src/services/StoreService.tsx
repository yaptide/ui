import { ReactNode, useRef, useState } from 'react';
import { Editor } from '../ThreeEditor/js/Editor';
import { createGenericContext } from '../util/GenericContext';
import { FinalSimulationStatusData, SimulationStatusData } from './ShSimulatorService';

export interface StoreProps {
	children: ReactNode;
}

export interface IStore {
	editorRef: React.MutableRefObject<Editor | undefined>;
	resultsSimulationData?: SimulationStatusData;
	setResultsSimulationData: React.Dispatch<
		React.SetStateAction<SimulationStatusData | undefined>
	>;
	localResultsSimulationData?: FinalSimulationStatusData[];
	setLocalResultsSimulationData: React.Dispatch<
		React.SetStateAction<FinalSimulationStatusData[]>
	>;
}

const [useStore, StoreContextProvider] = createGenericContext<IStore>();

const Store = (props: StoreProps) => {
	const editorRef = useRef<Editor>();
	const [resultsSimulationData, setResultsSimulationData] = useState<SimulationStatusData>();
	const [localResultsSimulationData, setLocalResultsSimulationData] = useState<
		FinalSimulationStatusData[]
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
