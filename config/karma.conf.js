/* eslint-disable */

const path = require('path');
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
    reporters: [ 'mocha' ], //report results in this format
    mochaReporter: {
      showDiff: true,
    },
    settings: {
      webSecurityEnabled: false,
    },
    webpack: { //kind of a copy of your webpack config
      devtool: 'inline-source-map', //just do inline source maps instead of the default
      module: {
        rules: [
          { test: /\.js$/, use: 'babel-loader', exclude: /node_modules/ }
        ]
      },
      resolve: {
        extensions: ['.js', '.jsx'],
        modules: [
          path.resolve('./src/'),
          path.resolve('./lib/'),
          path.resolve('./assets/'),
          path.resolve('./node_modules/'),
        ],
      },
      plugins: webpackConfig.plugins,
    },
    webpackServer: {
      noInfo: true,
    }
  });
};
