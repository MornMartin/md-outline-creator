const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CliJsDecoratePlugin = require('./CliJsDecoratePlugin');
module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: {
        index: './src/index.ts',
        cli: './src/cli.ts'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.(ts|js)$/,
                exclude: /(node_modules)/,
                use: [
                    {
                        loader: 'ts-loader',
                    },
                ],
            },
        ],
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: './package.json',
                    to: path.resolve(__dirname, 'dist'),
                },
                {
                    from: './README.md',
                    to: path.resolve(__dirname, 'dist'),
                },
            ],
        }),
        new CliJsDecoratePlugin({files: [path.resolve(__dirname, 'dist', 'cli.js')]})
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        fallback: {
            fs: false,
            path: false,
            buffer: false,
            crypto: false,
            assert: false,
        },
        extensions: ['.ts', '.js'],
    },
    target: 'node',
};
