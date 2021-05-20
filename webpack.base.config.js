const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require('copy-webpack-plugin')

const path = require('path')

const isProd = process.env.NODE_ENV === 'production'

function generateStyleLoaders (cssProcessors) {
    const loaders = [
        isProd ? {
            loader: MiniCssExtractPlugin.loader,
            options: {
                publicPath: '../',
            },
        } : 'style-loader',
        'css-loader',
        'postcss-loader'
    ]

    const styleTypes = ['css'].concat(cssProcessors)

    return styleTypes.map(suffix => ({
        test: new RegExp(`\\.${suffix}$`),
        use: suffix === 'css' ? loaders : loaders.concat(`${suffix}-loader`)
    }))
}


module.exports = {
    // 入口
    entry: './src/main.js',

    // 出口
    output: {
        filename: 'js/[name].[hash].js',    // hash 缓存
        path: path.resolve(__dirname, 'dist'),  // 目录对应一个绝对路径
        publicPath: isProd ? './' : '/' // 引用资源的地址
    },

    // 模块 规则
    module: {
        // loader 用于对模块的源代码进行转换
        rules: [
            ...generateStyleLoaders(['less']),
            {
                test: /\.(jpg|png|jpge|gif)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 1024,    // 当大于这个值时  默认使用 file-loader 处理
                        outputPath: './img'
                    }
                }
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader?cacheDirectory=true'
            }
        ]
    },

    // 解析
    resolve: {
        extensions: ['.js', '.less', '.css'],
        alias: {
          '@': path.resolve(__dirname, 'src')
        }
    },

    // 插件目的在于解决 loader 无法实现的其他事。
    plugins: [
        new CleanWebpackPlugin(),

        new HtmlWebpackPlugin({
            title: 'demo',
            filename: 'index.html',
            template: './index.html',
            scriptLoading: 'defer',
            inject: 'body',
        }),

        new webpack.ProgressPlugin(),

        // 编译期间添加的全局常量
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify(process.env.NODE_ENV)
        }),

        new CopyPlugin({
            patterns: [
                { from: './static', to: 'static' }
            ]
        })
    ],
}