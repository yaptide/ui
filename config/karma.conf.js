/* eslint-disable */

const path = require('path');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config');

module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS2'],
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
        loaders: [
          { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
        ]
      },
      resolve: {
        extensions: ['', '.js', '.jsx'],
        root: [
          path.resolve('./src/'),
          path.resolve('./lib/'),
          path.resolve('./assets/'),
        ],
      },
      plugins: webpackConfig.plugins,
    },
    webpackServer: {
      noInfo: true,
    }
  });
};
