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
		})
	);

	return webpackConfig;
};
