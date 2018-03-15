const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const config = require('./webpack.config.base');
const Crx = require('crx-webpack-plugin');
const UglifyJS = require('uglify-es');
const babel = require("babel-core");

const GLOBALS = {
  'process.env': {
    'NODE_ENV': JSON.stringify('production')
  },
  __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false'))
};

module.exports = merge(config, {
  entry: {
    panel: 'production.js',
    vendor: ['react', 'react-dom', 'react-redux', 'redux']
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, '../src/assets/extension/'),
        to: '',
        ignore: [ 'scripts/**/*' ]
      }, {
        from: path.join(__dirname, '../src/assets/extension/scripts/*.js'),
        to: '',
        flatten: true,
        transform: (content, path) => {
          return UglifyJS.minify(babel.transform(content).code).code;
        }
      }
    ]),
    // Avoid publishing files when compilation fails
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin(GLOBALS),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      output: {
        comments: false
      },
      sourceMap: false
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new Crx({
      keyFile: '../stubber.pem',
      contentPath: '../build',
      outputPath: '../',
      name: 'stubber'
    })
    // new ExtractTextPlugin({
    //   filename: 'css/app.css',
    //   allChunks: true
    // })
  ],
  module: {
    //noParse: /\.min\.js$/,
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
      },
      // {
      //   test: /\.scss$/,
      //   include: [
      //     path.resolve(__dirname, '../src/client/assets/javascripts'),
      //     path.resolve(__dirname, '../src/client/assets/styles/styles.scss'),
      //     path.resolve(__dirname, '../src/client/scripts')
      //   ],
      //   use: ExtractTextPlugin.extract({
      //     fallback: 'style-loader',
      //     use: [
      //       { loader: 'css-loader', options: { sourceMap: true } },
      //       'postcss-loader',
      //       { loader: 'sass-loader', options: { outputStyle: 'compressed' } }
      //     ]
      //   })
      // },
      // Sass + CSS Modules
      // {
      //   test: /\.scss$/,
      //   include: /src\/client\/assets\/javascripts/,
      //   loader: ExtractTextPlugin.extract({
      //     fallbackLoader: 'style',
      //     loader: [
      //       {
      //         loader: 'css',
      //         query: {
      //           modules: true,
      //           importLoaders: 1,
      //           localIdentName: '[path][name]__[local]--[hash:base64:5]'
      //         }
      //       },
      //       'postcss',
      //       { loader: 'sass', query: { outputStyle: 'compressed' } }
      //     ]
      //   })
      // },
      // CSS
      // {
      //   test: /\.css$/,
      //   use: ExtractTextPlugin.extract({
      //     fallback: 'style-loader',
      //     use: ['css-loader', 'postcss-loader']
      //   })
      // }
    ]
  },
});
