module.exports = function override(webpackConfig) {
	webpackConfig.module.rules.push({
		test: /\.(c|m)js$/,
		include: /node_modules/,
		type: 'javascript/auto'
	});

	return webpackConfig;
};
