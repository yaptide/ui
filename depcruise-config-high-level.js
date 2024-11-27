/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
	options: {
		includeOnly: '^src/(?!config|util|types|shared|libs|examples)(.*)$',

		tsPreCompilationDeps: false,

		tsConfig: {
			fileName: './tsconfig.json'
		},

		externalModuleResolutionStrategy: 'node_modules', // Default resolution

		progress: { type: 'none' }, // Disable progress logs for simplicity

		doNotFollow: {
			path: '^src/(?:__tests__|Loader)|^src/.*\\b(?:setupTests\\.ts|reset\\.d\\.ts|react-app-env\\.d\\.ts|Globals\\.d\\.ts|index\\.tsx|index\\.css|reportWebVitals\\.ts)$'
		},

		reporterOptions: {
			archi: {
				collapsePattern:
					'^src/(PythonConverter|JsRoot|ThreeEditor)|^src/(config|util|types|shared|libs|examples)|^src/[^/]+',
				// Collapse specific folders and contents beyond the second level

				theme: {
					modules: [
						{
							criteria: { collapsed: true }
							// attributes: { shape: 'box' } // Default shapes for simplicity
						}
					],
					graph: {
						splines: 'ortho', // Orthogonal connections for a cleaner appearance
						rankdir: 'TB', // Default top-to-bottom direction
						ranksep: '0.3', // Adjusted separation for clarity
						nodesep: '0.5'
					}
				}
			}
		}
	}
};
