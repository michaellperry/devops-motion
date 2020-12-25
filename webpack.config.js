const path = require('path');
const webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/client/index.ts',
    plugins: [
        new webpack.ProgressPlugin(),
        new HtmlWebpackPlugin({
            title: "DevOps Motion"
        })
    ],

    module: {
        rules: [{
            test: /\.(ts|tsx)$/,
            loader: 'ts-loader',
            include: [path.resolve(__dirname, 'src/client')],
            exclude: [/node_modules/]
        }, {
            test: /.(scss|css)$/,

            use: [{
                loader: "style-loader"
            }, {
                loader: "css-loader",

                options: {
                    sourceMap: true
                }
            }, {
                loader: "sass-loader",

                options: {
                    sourceMap: true
                }
            }]
        }]
    },

    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },

    optimization: {
        minimizer: [new TerserPlugin()],

        splitChunks: {
            cacheGroups: {
                vendors: {
                    priority: -10,
                    test: /[\\/]node_modules[\\/]/
                }
            },

            chunks: 'async',
            minChunks: 1,
            minSize: 30000,
            name: false
        }
    },

    output: {
        path: path.resolve(__dirname, "./dist/client"),
        filename: "scripts/[name].[contenthash].js"
    }
}