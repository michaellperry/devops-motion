const path = require('path');
const webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/client/index.tsx',
    plugins: [
        new webpack.ProgressPlugin(),
        new HtmlWebpackPlugin({
            template: "./views/index.html"
        })
    ],

    module: {
        rules: [{
            test: /\.(ts|tsx)$/,
            loader: 'ts-loader',
            include: [
                path.resolve(__dirname, './src/client'),
                path.resolve(__dirname, './src/shared')
            ],
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
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            '@shared': path.resolve(__dirname, './src/shared'),
            'jinaga': 'jinaga/dist/jinaga',
        }
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

    devtool: "source-map",
    output: {
        path: path.resolve(__dirname, "./dist/client"),
        filename: "scripts/[name].[contenthash].js"
    }
}