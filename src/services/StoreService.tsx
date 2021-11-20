import { ReactNode, useRef } from 'react';
import { Editor } from '../ThreeEditor/js/Editor';
import { createGenericContext } from '../util/GenericContext';

export interface StoreProps {
	children: ReactNode;
}

export interface IStore {
	editorRef: React.MutableRefObject<Editor | undefined>;
}

const [useStore, StoreContextProvider] = createGenericContext<IStore>();

const Store = (props: StoreProps) => {
	const editorRef = useRef<Editor>();

	const value: IStore = {
		editorRef,
	};

	return <StoreContextProvider value={value}>{props.children}</StoreContextProvider>;
};

export { useStore, Store };
