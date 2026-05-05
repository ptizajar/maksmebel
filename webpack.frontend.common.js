/* eslint-disable import/no-extraneous-dependencies */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/frontend/index",
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/frontend/index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "public", to: "public" }],
    }),
  ],
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist/static"),
    clean: true,
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.module\.css$/, // 1. Правило для CSS Modules
        use: [
          // 2. Какие лоадеры использовать
          "style-loader", // 3. Внедряет CSS в DOM
          {
            loader: "css-loader", // 4. Обрабатывает CSS
            options: {
              modules: {
                // 5. Включаем CSS Modules
                localIdentName: "[name]__[local]__[hash:base64:5]",
                // Как будут называться сгенерированные классы
              },
            },
          },
        ],
      },
      {
        test: /\.css$/, // 6. Правило для обычных CSS
        exclude: /\.module\.css$/, // 7. Исключаем CSS Modules
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: ["...", ".jsx", ".scss"],
  },
};
