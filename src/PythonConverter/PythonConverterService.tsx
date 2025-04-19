import * as Comlink from 'comlink';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { createGenericContext } from '../services/GenericContext';
import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { SimulatorType } from '../types/RequestTypes';
import { SimulationInputFiles } from '../types/ResponseTypes';
import { PythonWorker } from './PythonWorker';

declare global {
	interface Window {
		loadPyodide: any;
		pyodide: any;
	}
}
export interface PythonConverterProps {
	children?: ReactNode;
	loadPyodide?: any;
	onLoad?: (pyodide: any) => void;
}

export interface PythonConverterContext {
	convertJSON: (
		editorJson: EditorJson,
		simulator: SimulatorType
	) => Promise<Map<keyof RemoveIndex<SimulationInputFiles>, string>>;
	isConverterReady: boolean;
}

const [usePythonConverter, PythonConverterContextProvider] =
	createGenericContext<PythonConverterContext>();

const PYODIDE_LOADED = 'PYODIDE_LOADED';

/**
 *	PythonConverter  is react wrapper for pyodide.js and converter module.
 *	There can be only one instance of PythonConverter in the whole application.
 */
const PythonConverter = (props: PythonConverterProps) => {
	const workerRef = useRef<Comlink.Remote<PythonWorker> | null>(null);

	useEffect(() => {
		workerRef.current = Comlink.wrap<PythonWorker>(
			new Worker(new URL('./PythonWorker.ts', import.meta.url))
		);

		workerRef.current.initPyodide(
			Comlink.proxy(() => {
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

	const convertJSON = async (editorJSON: EditorJson, simulator: SimulatorType) => {
		return await workerRef.current!.convertJSON(editorJSON, simulator);
	};

	const value: PythonConverterContext = {
		convertJSON,
		isConverterReady
	};

	return (
		<PythonConverterContextProvider value={value}>
			{props.children}
		</PythonConverterContextProvider>
	);
};

export { PythonConverter as PythonConverterService, usePythonConverter };
