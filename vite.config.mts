import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { comlink } from 'vite-plugin-comlink';
import dynamicImport from 'vite-plugin-dynamic-import';
import svgrPlugin from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(async () => {
	return {
		plugins: [comlink(), 
			react(
				{include: '*.{jsx,tsx}',}
			), 
			viteTsconfigPaths(), svgrPlugin(), 
			dynamicImport()],
		worker: {
			plugins: () => [comlink()],
			format: 'es'
		},
		optimizeDeps: {
			exclude: ['PythonWorker.ts']
		},
		server: {
			port: 3000,
			open: true
		}
	};
});