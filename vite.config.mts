import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { comlink } from 'vite-plugin-comlink';
import dynamicImport from 'vite-plugin-dynamic-import';
import svgrPlugin from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import commonjs from 'vite-plugin-commonjs';
import EnvironmentPlugin from 'vite-plugin-environment';
import { configDefaults } from 'vitest/config';
// https://vitejs.dev/config/
export default defineConfig(async () => {
	return {
		plugins: [comlink(), 
			react(
				{include: '*.{jsx,tsx}',}
			), 
			viteTsconfigPaths(), svgrPlugin(), 
			dynamicImport(),
			nodePolyfills(),
			commonjs(),
			EnvironmentPlugin({ NODE_ENV: 'production',}),
		],
		define: {
			'process.env.NODE_ENV': 'production',
		},
		worker: {
			plugins: () => [comlink()],
			format: 'es'
		},
		optimizeDeps: {
			exclude: ['PythonWorker.ts'],
			include: ['react', 'react-dom', '@emotion/react', 'fflate']
		},
		build: {
			target: "esnext",
			rollupOptions: {
			  external: ['fflate', 'specificity']
			}
		},
		test: {
			environment: 'node',
			globals: true,
			coverage: {
			  reporter: ['text', 'json', 'html'],
			},
			exclude: [...configDefaults.exclude, 'e2e/*', 'src/__tests__/TopasConverter.test.ts'],
		  },
		server: {
			port: 3000,
			open: true
		}
	};
});
