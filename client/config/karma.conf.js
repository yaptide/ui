/* eslint-disable */

var webpack = require('webpack');
var webpackConfig = require('./webpack.config');

module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],
    singleRun: true,
    frameworks: [ 'mocha' ],
    files: [
      'tests.webpack.js',
    ],
    preprocessors: {
      'tests.webpack.js': [ 'webpack', 'sourcemap' ]
    },
    reporters: [ 'dots' ], //report results in this format
    webpack: { //kind of a copy of your webpack config
      devtool: 'inline-source-map', //just do inline source maps instead of the default
      module: {
        loaders: [
          { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
        ]
      },
      plugins: webpackConfig.plugins,
    },
    webpackServer: {
    }
  });
};
