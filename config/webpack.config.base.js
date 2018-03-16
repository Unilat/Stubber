// Common Webpack configuration used by webpack.config.development and webpack.config.production

const path = require('path');
const webpack = require('webpack');

module.exports = {
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '../build'),
        publicPath: '/'
    },
    resolve: {
        modules: [
            path.join(__dirname, '../src/scripts'),
            path.join(__dirname, '../src/assets'),
            path.join(__dirname, '../src/assets/javascripts'),
            'node_modules'
        ],
        extensions: ['.js', '.jsx', '.json', '.scss']
    },
    plugins: [
        // Shared code
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: 'vendor.bundle.js',
            minChunks: Infinity
        })
    ],
    module: {
        rules: [
            // JavaScript / ES6
            {
                test: /\.jsx?$/i,
                include: [
                    path.resolve(__dirname, '../src/assets/javascripts'),
                    path.resolve(__dirname, '../src/assets/extension/scripts')
                ],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['react', 'es2015', 'stage-2']
                    }
                }
            },
            // Images
            // Inline base64 URLs for <=8k images, direct URLs for the rest
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: './images/[name].[ext]?[hash]',
                        publicPath: ''
                    }
                }
            },
            // Fonts
            {
                test: /\.(woff|woff2|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                        name: 'fonts/[name].[ext]?[hash]'
                    }
                }
            }
        ]
    }
};
