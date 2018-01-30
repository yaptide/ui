/* eslint-disable */
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');


const env = process.env.NODE_ENV;

const BACKEND_PUBLIC_URL = process.env.YAPTIDE_BACKEND_PUBLIC_URL;
const FRONTEND_PORT = process.env.YAPTIDE_FRONTEND_PORT;

const __PROD__ = env === 'production';
const __DEV__ = env === 'development';
const __TEST__ = env === 'test';

const ENTRY_PATH = __dirname + '/../src/main.js';
const DEPLOY_PATH = __dirname + '/../static/';
const ENV_JS = __dirname + '../src/env.js';

const config = {
  entry: {
    app: ENTRY_PATH,
    vendors: ['react', 'redux', 'react-redux', 'react-router'],
  },

  output: {
    path: DEPLOY_PATH,
    filename: '[name].js',
  },
  devtool: "source-map",
  devServer: {
    inline: true,
    hot: true,
    port: FRONTEND_PORT,
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


  module: {
    rules: [],
  },
  plugins: [],
  externals: {},
};

const rules= config.module.rules;
rules.push({
  test: /\.js$/,
  exclude: /node_modules/,
  use: 'babel-loader',
});

rules.push({
  test: /env/,
  use: 'url-loader',
});

rules.push({
  test: /\.css$/, use: ['style-loader', 'css-loader'],
});

rules.push({
  test: /\.scss$/,
  use: ExtractTextPlugin.extract({
    fallback: 'style-loader',
    use: [
      'css-loader?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]&sourceMap' + "!" +
      'sass-loader?sourceMap'
    ]
  })
});

rules.push(
  { test: /\.woff(\?.*)?$/, use: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff' },
  { test: /\.woff2(\?.*)?$/, use: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff2' },
  { test: /\.otf(\?.*)?$/, use: 'file?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=font/opentype' },
  { test: /\.ttf(\?.*)?$/, use: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/octet-stream' },
  { test: /\.eot(\?.*)?$/, use: 'file?prefix=fonts/&name=[path][name].[ext]' },
  { test: /\.svg(\?.*)?$/, use: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=image/svg+xml' },
  { test: /\.(png|jpg)$/, use: 'url?limit=8192' }
)

const plugins = config.plugins
if (!__TEST__) {
  plugins.push(
    new FaviconsWebpackPlugin('favicon.png'),
    new HtmlWebpackPlugin({
      title: 'yaptide',
      template: './src/index.html',
    }),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new ExtractTextPlugin("[name].[contenthash].css", {
      allChunks: true,
    })
  );
}

plugins.push(
  new webpack.DefinePlugin({
    'process.env.BACKEND_PUBLIC_URL': JSON.stringify(BACKEND_PUBLIC_URL),
    __DEV__,
    __TEST__,
    __PROD__,
  })
)
if (__PROD__) {
  plugins.push(
    new webpack.optimize.OccurrenceOrderPlugin(),
  );

  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        unused: true,
        dead_code: true,
        warnings: false,
      }
    })
  );
}

if (__TEST__) {
  plugins.push(function () {
    this.plugin('done', function (stats) {
      if (stats.compilation.errors.length) {
        // Pretend no assets were generated. This prevents the tests
        // from running making it clear that there were warnings.
        throw new Error(
          stats.compilation.errors.map(err => err.message || err)
        )
      }
    })
  })
}


const externals = config.externals;

externals['react/lib/ExecutionEnvironment'] = true;
externals['react/lib/ReactContext'] = true;
externals['react/addons'] = true;
externals['env'] = 'env.js';


module.exports = config;
