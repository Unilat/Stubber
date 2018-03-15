const merge = require('webpack-merge');
const webpack = require('webpack');
const config = require('./webpack.config.base');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const GLOBALS = {
  'process.env': {
    'NODE_ENV': JSON.stringify('development')
  },
  __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'true'))
};

module.exports = merge(config, {
  watch: true,
  watchOptions: {
    ignored: /node_modules/
  },
  cache: true,
  devtool: 'inline-source-map',//'cheap-module-eval-source-map',
  entry: {
    panel: 'development',
    vendor: ['react', 'react-dom', 'react-redux', 'redux']
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, '../src/assets/extension/'),
        to: ''
      }
    ]),
    new webpack.DefinePlugin(GLOBALS),
    // new ExtractTextPlugin(path.resolve(__dirname, '../build/client/css/main.css'), {
    //   allChunks: true
    // })
  ],
  module: {
    rules: [
      // Sass
      {
        test: /\.scss$/,
        include: [
          path.resolve(__dirname, '../src/assets/javascripts'),
          path.resolve(__dirname, '../src/assets/styles/styles.scss'),
          path.resolve(__dirname, '../src/scripts')
        ],
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          { loader: 'sass-loader', options: { outputStyle: 'expanded'} }
        ]
        // use: ExtractTextPlugin.extract({
        //   fallback: 'style-loader',
        //   use: [
        //     'css-loader',
        //     'postcss-loader',
        //     'sass-loader'
        //   ]
        // })
      }
    ]
  }
});
