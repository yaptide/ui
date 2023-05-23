module.exports = function override(webpackConfig) {
	// allows create-react-app to load modules with `.cjs` and `.mjs` extension types
	webpackConfig.module.rules.push({
		test: /\.(c|m)js$/,
		include: /node_modules/,
		type: 'javascript/auto'
	});

	return webpackConfig;
};
