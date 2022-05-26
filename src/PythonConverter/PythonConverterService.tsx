import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { createGenericContext } from '../util/GenericContext';
import makeAsyncScriptLoader from 'react-async-script';
import { InputFiles } from '../services/ShSimulatorService';

const PythonConverterUrl = 'https://cdn.jsdelivr.net/pyodide/v0.20.0/full/pyodide.js';

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
	pyodide: any;
	convertJSON: (editorJSON: object) => Promise<Map<keyof InputFiles, string>>;
	isConverterReady: boolean;
}

const [usePythonConverter, PythonConverterContextProvider] =
	createGenericContext<IPythonConverter>();

const pythonConverterCode = `
import os
from converter.api import run_parser
from converter.api import get_parser_from_str
def convertJson(editor_json, parser_name = 'shieldhit'):
	parser=get_parser_from_str(parser_name)
	return run_parser(parser, editor_json.to_py(), None, True)
convertJson`;

const pythonCheckConverterCode = `
def checkIfConverterReady():
	try:
		from converter.api import run_parser
		print("module 'converter' is installed")
		return True
	except ModuleNotFoundError:
		print("module 'converter' is not installed")
		return False
checkIfConverterReady
`;

const PythonConverter = (props: PythonConverterProps) => {
	const [pyodide, setPyodide] = useState<any>();
	const [isConverterReady, setConverterReady] = useState(false);

	const checkIfConvertReady = useCallback(() => {
		console.log('checkIfConvertReady', !!pyodide);
		return pyodide && pyodide.runPython(pythonCheckConverterCode)();
	}, [pyodide]);

	useEffect(() => {
		if (!props.loadPyodide) return;

		async function initPyodide() {
			if (window.pyodide) {
				setPyodide(window.pyodide);
				setConverterReady(checkIfConvertReady());
				return;
			}

			const pyodide = await props.loadPyodide();
			window.pyodide = pyodide;

			console.log(pyodide.runPython('import sys\nsys.version'));

			await pyodide.loadPackage(['scipy', 'micropip']);

			await pyodide.runPythonAsync(`			
import micropip
await micropip.install('/libs/converter/dist/yaptide_converter-1.0.0-py3-none-any.whl') 
print(micropip.list())
			`);
			console.log('pyodide loaded');
			setPyodide(pyodide);
			setConverterReady(checkIfConvertReady());
		}

		initPyodide();

		return () => {};
	}, [checkIfConvertReady, props]);

	const convertJSON = async (editorJSON: object) => {
		const runPythonConvert = pyodide.runPython(pythonConverterCode);
		return runPythonConvert(editorJSON).toJs();
	};

	const value: IPythonConverter = {
		pyodide,
		convertJSON,
		isConverterReady
	};

	return (
		<PythonConverterContextProvider value={value}>
			{props.children}
		</PythonConverterContextProvider>
	);
};

const AsyncLoaderPythonConverter = makeAsyncScriptLoader(PythonConverterUrl, {
	globalName: 'loadPyodide'
})(PythonConverter);

export { usePythonConverter, AsyncLoaderPythonConverter as PythonConverterService };
