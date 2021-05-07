const path = require('path');

module.exports = {
  mode: 'development',

  entry: './index.ts',

  output: {
    filename: 'index.js'
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader'
      }
    ]
  },

  resolve: {
    modules: [
      'node_modules',
    ],
    extensions: [
    '.ts',
    '.js'
    ]
  }
};
