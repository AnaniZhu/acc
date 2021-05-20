
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseConfig = require('./webpack.base.config')

module.exports = merge(baseConfig, {
    mode: 'development',

    devServer: {
        hot: true, // 启动热更新
        port: 8080,
        contentBase: './dist', // 告诉服务器从哪里读取资源
        open: true, // 自动打开浏览器
        watchContentBase: true
    },

    plugins: [
        // 热更新
        new webpack.HotModuleReplacementPlugin(),
    ],
    
    devtool: 'eval-cheap-module-source-map'
})