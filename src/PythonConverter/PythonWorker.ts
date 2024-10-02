/* eslint-disable class-methods-use-this */
/* eslint-disable no-restricted-globals */
import * as Comlink from 'comlink';

import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { SimulatorType } from '../types/RequestTypes';
import { SimulationInputFiles } from '../types/ResponseTypes';

export interface PythonWorker {
	initPyodide: (onReady: () => void) => void;
	close: () => void;
	runPython: <T>(string: string) => T;
	checkConverter: () => boolean;

	convertJSON: (
		editorJson: EditorJson,
		simulator: SimulatorType
	) => Promise<Map<keyof RemoveIndex<SimulationInputFiles>, string>>;
}

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

class PythonWorkerBase implements PythonWorker {
	readonly isPythonWorker: true = true;
	async initPyodide(onReady: () => void) {
		const pyodideDownloadLink = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/';
		const pyodideUrl = pyodideDownloadLink + 'pyodide.js';

		const response = await fetch(pyodideUrl);
		const code = await response.text();

		eval(code);

		const pyodide = await self.loadPyodide({ indexURL: pyodideDownloadLink });

		self.pyodide = pyodide;

		console.log(pyodide.runPython('import sys\nsys.version'));

		await pyodide.loadPackage(['micropip']);
		const publicURL = import.meta.env.PUBLIC_URL || '';
		const converterFolder = publicURL + '/libs/converter/dist/';
		const jsonUrl = converterFolder + 'yaptide_converter.json';

		const json = await (await fetch(jsonUrl)).json();
		const { fileName: converterFileName } =
			typeof json === 'object' && json && 'fileName' in json ? json : { fileName: undefined };

		if (!converterFileName) throw new Error('converterFileName is not defined');

		await pyodide.runPythonAsync(`			
import micropip
await micropip.install('${publicURL}/libs/converter/dist/${converterFileName}') 
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

	convertJSON(editorJson: object, simulator: SimulatorType) {
		const pythonConverterCode = `
		import os
		from converter.api import run_parser
		from converter.api import get_parser_from_str
		def convertJson(editor_json, parser_name = '${simulator}'):
			parser=get_parser_from_str(parser_name)
			return run_parser(parser, editor_json.to_py(), None, True)
		convertJson`;

		return self.pyodide.runPython(pythonConverterCode)(editorJson).toJs();
	}
}

const worker = new PythonWorkerBase();

Comlink.expose(worker);
