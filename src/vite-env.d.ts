/// <reference types="vite/client" />
/// <reference types="vite-plugin-comlink/client" />
declare module 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js' {
	const loadPyodide: any;
	export { loadPyodide };
}
