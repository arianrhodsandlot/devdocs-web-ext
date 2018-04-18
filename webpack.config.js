const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    popup: './src/popup',
    background: './src/background',
    options: './src/options'
  },
  output: {
    path: path.resolve('./extension/dist')
  },
  module: {
    rules: [{
      test: /\.(js)$/,
      use: [{
          loader: "babel-loader"
        }
      ]
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'popup.html',
      template: 'src/popup/popup.html',
      chunks: ['popup']
    }),
    new HtmlWebpackPlugin({
      filename: 'background.html',
      template: 'src/background/background.html',
      chunks: ['background']
    }),
    new HtmlWebpackPlugin({
      filename: 'options.html',
      template: 'src/options/options.html',
      chunks: ['options']
    })
  ]
}
