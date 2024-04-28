const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    cache: true,
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: {
        viewer: path.resolve(__dirname, './src/viewer/index.tsx'),
        background: path.resolve(__dirname, './src/background/background.ts'),
        contentScriptForNicoNico: path.resolve(__dirname, './src/adapter/contentScriptForNicoNico.ts'),
    },
    output: {
        publicPath: '/',
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
        ],
    },
    devServer: {
        port: 3001,
    },
    plugins: [
        // new HtmlWebpackPlugin({
        //     template: path.resolve(__dirname, './src/index.html'),
        // }),
        new ForkTsCheckerWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [{ from: 'src/static', to: './' }],
        }),
    ],
};
