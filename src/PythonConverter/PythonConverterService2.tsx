import { ReactNode, useEffect, useState } from 'react';
import { createGenericContext } from '../util/GenericContext';
import makeAsyncScriptLoader from 'react-async-script';
import React from 'react';
import { Path } from 'three';
import { URL } from 'url';

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
}

export interface IPythonConverter {}

const [usePythonConverter, PythonConverterContextProvider] =
	createGenericContext<IPythonConverter>();

const PythonConverter = (props: PythonConverterProps) => {
	const [value] = useState<IPythonConverter>();

	useEffect(() => {
		if (!props.loadPyodide) return;

		async function main() {
			let pyodide = window.pyodide;

			if (!pyodide) {
				pyodide = await props.loadPyodide();
				console.log(window.pyodide);
				window.pyodide = pyodide;
				// Pyodide is now ready to use...
				console.log(
					pyodide.runPython(`
import sys
sys.version
			`)
				);
			}

			await pyodide.loadPackage(['matplotlib', 'numpy', 'scipy', 'micropip']);

			const moduleWhl = 'yaptide_converter-1.0.0-py3-none-any.whl';
			// eslint-disable-next-line import/no-webpack-loader-syntax
			let moduleUrl = (await import('!!file-loader!../libs/converter/dist/yaptide_converter-1.0.0-py3-none-any.whl')).default;
			console.log(moduleUrl);
			// moduleUrl = '/libs/converter.zip';
			// import os
			// os.rename('converter-yaptide-0.0.0','converter-yaptide')
			await pyodide.runPythonAsync(`

import micropip
from pyodide.http import pyfetch
response = await pyfetch("${moduleUrl}")
if response.status == 200:
	with open("${moduleWhl}", "wb") as f:
		f.write(await response.bytes())
from os import listdir
await micropip.install('/files/yaptide_converter-1.0.0-py3-none-any.whl') 
print(micropip.list())

from converter.main import convert



response = await pyfetch("/libs/sh_parser_test.json")
if response.status == 200:
	with open("sh_parser_test.json", "wb") as f:
		f.write(await response.bytes())

import os
convert("shieldhit",open("sh_parser_test.json", "r"),os.path.curdir,True)
print(os.listdir())


			`);
			// print(listdir())


			// 			from pyodide.http import pyfetch
			// response = await pyfetch("${moduleUrl}") # .zip, .whl, ...
			// await response.unpack_archive(format="zip") # by default, unpacks to the current dir

			// import os
			// from converter.main import convert
			// print(os.listdir())
			// convert("shieldhit",open("sh_parser_test.json", "r"),os.path.curdir,True)
			// print(os.listdir())
			// print(open("beam.dat", "r").read())
			// print(open("mat.dat", "r").read())
			// print(open("detect.dat", "r").read())
			// print(open("geo.dat", "r").read())
			
			// let json = await import('../asset/sh_parser_test.json');
			// console.log('JSON', json);
			// console.log(api.run_parser('shieldhit', json, '.', true));

			// await import('../asset/source/pyscript.py').then(async url => {
			// 	return pyodide.runPython(
			// 		await fetch(url.default).then(response => response.text())
			// 	);
			// });
		}

		main();

		return () => {};
	}, [props]);

	// 	const pyScript = `
	// 	<div id="plot"></div>
	// ${PyScriptString}
	// 		`;

	return (
		<PythonConverterContextProvider value={value}>
			{props.children}
		</PythonConverterContextProvider>
	);
};

const AsyncLoaderPythonConverter = makeAsyncScriptLoader(PythonConverterUrl, {
	globalName: 'loadPyodide'
})(PythonConverter);

export { usePythonConverter, AsyncLoaderPythonConverter as PythonConverterService2 };
