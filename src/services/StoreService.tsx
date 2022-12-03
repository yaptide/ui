import { ReactNode, useRef, useState } from 'react';
import { Editor } from '../ThreeEditor/js/Editor';
import { createGenericContext } from '../util/GenericContext';
import { FinalSimulationStatusData, InputFiles, SimulationStatusData } from './ShSimulatorService';

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
	inputFiles?: InputFiles;
	setInputFiles: React.Dispatch<React.SetStateAction<InputFiles | undefined>>;
}

const [useStore, StoreContextProvider] = createGenericContext<IStore>();

const Store = (props: StoreProps) => {
	const editorRef = useRef<Editor>();
	const [resultsSimulationData, setResultsSimulationData] = useState<SimulationStatusData>();
	const [localResultsSimulationData, setLocalResultsSimulationData] = useState<
		FinalSimulationStatusData[]
	>([]);
	const [inputFiles, setInputFiles] = useState<InputFiles>();

	const value: IStore = {
		editorRef,
		resultsSimulationData,
		setResultsSimulationData,
		localResultsSimulationData,
		setLocalResultsSimulationData,
		inputFiles,
		setInputFiles
	};

	return <StoreContextProvider value={value}>{props.children}</StoreContextProvider>;
};

export { useStore, Store };
