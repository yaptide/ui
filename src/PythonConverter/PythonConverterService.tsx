import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import * as Comlink from 'comlink';
import { createGenericContext } from '../services/GenericContext';
import { IPythonWorker } from './PythonWorker';
import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { SimulationInputFiles } from '../types/Response';

declare global {
	interface Window {
		loadPyodide: any;
		pyodide: any;
	}
}
export interface PythonConverterProps {
	children: ReactNode;
	loadPyodide?: any;
	onLoad?: (pyodide: any) => void;
}

export interface IPythonConverter {
	convertJSON: (editorJson: EditorJson) => Promise<Map<keyof SimulationInputFiles, string>>;
	isConverterReady: boolean;
}

const [usePythonConverter, PythonConverterContextProvider] =
	createGenericContext<IPythonConverter>();

const PYODIDE_LOADED = 'PYODIDE_LOADED';

/**
 *	PythonConverter  is react wrapper for pyodide.js and converter module.
 *	There can be only one instance of PythonConverter in the whole application.
 */
const PythonConverter = (props: PythonConverterProps) => {
	const workerRef = useRef<Comlink.Remote<IPythonWorker>>();

	useEffect(() => {
		workerRef.current = Comlink.wrap<IPythonWorker>(
			new Worker(new URL('./PythonWorker.ts', import.meta.url))
		);
		workerRef.current.initPyodide(
			Comlink.proxy(() => {
				console.log('PythonConverter: callback from worker');
				document.dispatchEvent(new CustomEvent(PYODIDE_LOADED));
			})
		);
		return () => {
			workerRef.current?.close();
		};
	}, []);

	const [isConverterReady, setConverterReady] = useState(false);

	const checkIfConvertReady = useCallback(async () => {
		return !!(workerRef.current && (await workerRef.current.checkConverter()));
	}, []);

	useEffect(() => {
		const handleLoad = async () => {
			setConverterReady(await checkIfConvertReady());
		};

		document.addEventListener(PYODIDE_LOADED, handleLoad);
		return () => {
			document.removeEventListener(PYODIDE_LOADED, handleLoad);
		};
	});

	const convertJSON = async (editorJSON: EditorJson) => {
		return await workerRef.current!.convertJSON(editorJSON);
	};

	const value: IPythonConverter = {
		convertJSON,
		isConverterReady
	};

	return (
		<PythonConverterContextProvider value={value}>
			{props.children}
		</PythonConverterContextProvider>
	);
};

export { usePythonConverter, PythonConverter as PythonConverterService };
