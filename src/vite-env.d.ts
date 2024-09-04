/// <reference types="vite/client" />
/// <reference types="vite-plugin-comlink/client" />
declare module 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js' {
	const loadPyodide: any;
	export { loadPyodide };
}
