const merge = require('webpack-merge')
const baseConfig = require('./webpack.base.config')
// 分离 css 成单独文件 代替 extract-text-webpack-plugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// 合并配置
// 生产环境下 webpack 会自动添加一些优化操作
module.exports = merge(baseConfig, {
    mode: 'production',
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].[hash].css',
            chunkFilename: '[id].css',
        }),
    ],

    // 优化
    optimization: {
        splitChunks: {
            cacheGroups: {
                common: {
                    test: /node_modules/,
                    name: 'common',
                    chunks: 'all'
                }
            }
        }
    },
    // devtool: 'source-map'
})
