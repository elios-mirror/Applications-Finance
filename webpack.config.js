const path = require('path');
const NodemonPlugin = require('nodemon-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    target: 'node',
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.node$/,
                use: 'node-loader'
            },
            {
                test: /\.html$/,
                use: 'html-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.node', '.html']
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new NodemonPlugin(),
        new HtmlWebpackPlugin()
    ]
};
