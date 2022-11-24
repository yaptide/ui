/* eslint-disable no-restricted-globals */
import * as Comlink from 'comlink';
import { InputFiles } from '../services/ShSimulatorService';
import { EditorJson } from '../ThreeEditor/js/EditorJson';

// as for now there is no reasonable npm package for pyodide
// CND method is suggested in https://pyodide.org/en/stable/usage/downloading-and-deploying.html
importScripts("https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.js");

export interface IPythonWorker {
	initPyodide: (onReady: () => void) => void;
	close: () => void;
	runPython: <T>(string: string) => T
	checkConverter: () => boolean;
	convertJSON: (editorJson: EditorJson) => Promise<Map<keyof InputFiles, string>>;
}


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
checkIfConverterReady()
`;

class PythonWorkerBase implements IPythonWorker {
	readonly isPythonWorker: true = true;
	async initPyodide(onReady: () => void) {

		const pyodide = await self.loadPyodide();
		self.pyodide = pyodide;

		console.log(pyodide.runPython('import sys\nsys.version'));

		await pyodide.loadPackage(['scipy', 'micropip']);

		const converterFolder = process.env.PUBLIC_URL + '/libs/converter/dist/';
		const jsonUrl = converterFolder + 'yaptide_converter.json';

		const { fileName: converterFileName } = await (
			await fetch(jsonUrl)
		).json();

		if (!converterFileName) throw new Error('converterFileName is not defined');

		await pyodide.runPythonAsync(`			
import micropip
await micropip.install('${process.env.PUBLIC_URL}/libs/converter/dist/${converterFileName}') 
print(micropip.list())
			`);
		onReady();
	}

	close() {
		self.close();
	}


	runPython(string: string) {
		return self.pyodide.runPython(string);
	}

	checkConverter() {
		return self.pyodide.runPython(pythonCheckConverterCode);
	}

	convertJSON(editorJson: object) {
		return self.pyodide.runPython(pythonConverterCode)(editorJson).toJs();
	}
}

const worker = new PythonWorkerBase();

Comlink.expose(worker);
