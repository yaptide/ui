import * as Comlink from 'comlink';
var loadPyodide: any;
importScripts("https://cdn.jsdelivr.net/pyodide/v0.21.2/full/pyodide.js");

export interface IPythonWorker {
	log: (json: string) => unknown;
}



class PythonWorkerBase implements IPythonWorker {
	readonly isPythonWorker: true = true;
	async initPyodide() {
		console.log('initPyodide');
		const pyodide = await loadPyodide();
		console.log('initPyodide2');
		window.pyodide = pyodide;

		console.log(pyodide.runPython('import sys\nsys.version'));

		await pyodide.loadPackage(['scipy', 'micropip']);

		const converterFolder = process.env.PUBLIC_URL + '/libs/converter/dist/';

		const { fileName: converterFileName } = await (
			await fetch(converterFolder + 'yaptide_converter.json')
		).json();

		if (!converterFileName) throw new Error('converterFileName is not defined');

		await pyodide.runPythonAsync(`			
import micropip
await micropip.install('${process.env.PUBLIC_URL}/libs/converter/dist/${converterFileName}') 
print(micropip.list())
			`);
	}

	async log(json: string) {
		console.log('PythonWorker', json);
		return json;
	}
}

const worker = new PythonWorkerBase();
worker.initPyodide();

Comlink.expose(worker);
