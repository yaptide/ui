/* @flow */
/* eslint-disable */
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');


const env = process.env.NODE_ENV;
const config = {
  entry: './src/main.js',

  output: {
    path: '../dist/',
    filename: 'index_bundle.js',
  },

  devServer: {
    inline: true,
    port: 8080,
  },

  resolve: {
    extensions: ['', '.js', '.jsx'],
    root: [
      path.resolve('./src/'),
    ],
  },


  module: {
    loaders: [],
  },
  plugins: [],
};

const loaders = [];

loaders.push({
  test: /\.js$/,
  exclude: /node_modules/,
  loader: 'babel-loader',

  query: {
    presets: ['es2015', 'react'],
  },
});

loaders.push({
  test: /\.css$/, loaders: ['style-loader', 'css-loader'],
});

loaders.push({
  test: /\.scss$/,
  loaders: [
    'style-loader',
    'css-loader?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]',
    'sass-loader',
  ],
});

loaders.push(
  { test: /\.woff(\?.*)?$/, loader: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff' },
  { test: /\.woff2(\?.*)?$/, loader: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff2' },
  { test: /\.otf(\?.*)?$/, loader: 'file?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=font/opentype' },
  { test: /\.ttf(\?.*)?$/, loader: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/octet-stream' },
  { test: /\.eot(\?.*)?$/, loader: 'file?prefix=fonts/&name=[path][name].[ext]' },
  { test: /\.svg(\?.*)?$/, loader: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=image/svg+xml' },
  { test: /\.(png|jpg)$/, loader: 'url?limit=8192' }
)

const plugins = [];
plugins.push(
  new HtmlWebpackPlugin({
    title: 'Palantir',
    template: './src/index.html',
  })
);


config.module.loaders = loaders;
config.plugins = plugins;
module.exports = config;
