const webpack = require('webpack');

module.exports = function override(webpackConfig) {
	// react-dnd
	webpackConfig.module.rules.unshift({
		test: /\.m?js$/,
		resolve: {
			fullySpecified: false // disable the behaviour
		}
	});

	// react-dnd
	webpackConfig.resolve.alias = {
		...webpackConfig.resolve.alias,
		'react/jsx-runtime.js': 'react/jsx-runtime',
		'react/jsx-dev-runtime.js': 'react/jsx-dev-runtime'
	};

	// allows create-react-app to load modules with `.cjs` and `.mjs` extension types
	webpackConfig.module.rules.push({
		test: /\.(c|m)js$/,
		include: /node_modules/,
		type: 'javascript/auto'
	});

	webpackConfig.plugins.push(
		new webpack.IgnorePlugin({
			resourceRegExp: /geant4_wasm\.wasm$/
		}),
		new webpack.IgnorePlugin({
			resourceRegExp: /node:worker_threads$/
		})
	);

	return webpackConfig;
};

// three is ESM-only since r186 (`three.cjs` is a deprecated shim re-exporting `three.module.js`),
// so Jest has to convert it to CommonJS and should resolve `three` straight to its ES module build
module.exports.jest = function overrideJest(jestConfig) {
	jestConfig.transformIgnorePatterns = [
		'[/\\\\]node_modules[/\\\\](?!three[/\\\\]).+\\.(js|jsx|mjs|cjs|ts|tsx)$',
		'^.+\\.module\\.(css|sass|scss)$'
	];

	// only the module syntax needs converting, Node runs the rest of three natively
	jestConfig.transform = {
		'[/\\\\]node_modules[/\\\\]three[/\\\\].+\\.js$': [
			require.resolve('babel-jest'),
			{
				babelrc: false,
				configFile: false,
				plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')]
			}
		],
		...jestConfig.transform
	};

	jestConfig.moduleNameMapper = {
		...jestConfig.moduleNameMapper,
		'^three$': '<rootDir>/node_modules/three/build/three.module.js'
	};

	return jestConfig;
};
