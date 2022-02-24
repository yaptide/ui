import { ReactNode, useRef, useState } from 'react';
import { Editor } from '../ThreeEditor/js/Editor';
import { createGenericContext } from '../util/GenericContext';
import { SimulationStatusData } from './ShSimulatorService';

export interface StoreProps {
	children: ReactNode;
}

export interface IStore {
	editorRef: React.MutableRefObject<Editor | undefined>;
	resultsSimulationData?: SimulationStatusData;
	setResultsSimulationData: React.Dispatch<
		React.SetStateAction<SimulationStatusData | undefined>
	>;
}

const [useStore, StoreContextProvider] = createGenericContext<IStore>();

const Store = (props: StoreProps) => {
	const editorRef = useRef<Editor>();
	const [resultsSimulationData, setResultsSimulationData] = useState<SimulationStatusData>();

	const value: IStore = {
		editorRef,
		resultsSimulationData,
		setResultsSimulationData
	};

	return <StoreContextProvider value={value}>{props.children}</StoreContextProvider>;
};

export { useStore, Store };
