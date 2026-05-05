/* eslint-disable import/no-extraneous-dependencies */
const { merge } = require("webpack-merge");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");
const common = require("./webpack.frontend.common");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = merge(common, {
  mode: "production",
  plugins: [
    new MiniCSSExtractPlugin(),
    new CompressionPlugin({
      filename: "[path][base].gz", // создаёт .gz рядом с файлом
      algorithm: "gzip",
      test: /\.(js|css|html|svg)$/,
      threshold: 1024, // только файлы >1kb
      minRatio: 0.8,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/images/[hash][ext]",
        },
      },
      {
        test: /\.module\.s(a|c)ss$/,
        use: [
          MiniCSSExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[hash:base64]",
              },
            },
          },
          "sass-loader",
        ],
      },
      {
        test: /\.s(a|c)ss$/,
        exclude: /\.module.(s(a|c)ss)$/,
        use: [MiniCSSExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
});
