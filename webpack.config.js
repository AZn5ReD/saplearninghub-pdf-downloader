const path = require("path");
const StringReplacePlugin = require("string-replace-webpack-plugin");

module.exports = {
  mode: process.NODE_ENV || "development",
  // entry: "./src",
  entry: {
      index: './src/main.js',
      openChrome: './src/openChrome.js',
  },
  target: "node",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    chunkFilename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        query: {
          presets: ["@babel/env"],
        },
      },
      {
        test: /\.node$/,
        use: [
          {
            loader: "native-addon-loader",
            options: { name: "[name]-[hash].[ext]" },
          },
        ],
      },

      {
        enforce: "pre",
        test: /unicode-properties[\/\\]unicode-properties/,
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: "var fs = _interopDefault(require('fs'));",
              replacement: function () {
                return "var fs = require('fs');";
              },
            },
          ],
        }),
      },
      {
        test: /unicode-properties[\/\\]unicode-properties/,
        loader: "transform-loader?brfs",
      },
      { test: /pdfkit[/\\]js[/\\]/, loader: "transform-loader?brfs" },
      { test: /fontkit[\/\\]index.js$/, loader: "transform-loader?brfs" },
      {
        test: /linebreak[\/\\]src[\/\\]linebreaker.js/,
        loader: "transform-loader?brfs",
      },
    ],
  },
  resolve: {
    extensions: [".js"],
    alias: {
      "unicode-properties": "unicode-properties/unicode-properties.cjs.js",
      pdfkit: "pdfkit/js/pdfkit.js",
    },
  },
  plugins: [new StringReplacePlugin()],
};
