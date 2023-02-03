const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const { VanillaExtractPlugin } = require('@vanilla-extract/webpack-plugin');
const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
const path = require('path');

module.exports = {
  webpack: {
    plugins: [
      new VanillaExtractPlugin(),
      new NodePolyfillPlugin({
        excludeAliases: [
          'assert',
          'console',
          'constants',
          'crypto',
          'domain',
          'events',
          // 'http',
          // 'https',
          // 'os',
          'path',
          'punycode',
          'querystring',
          '_stream_duplex',
          '_stream_passthrough',
          '_stream_transform',
          '_stream_writable',
          'string_decoder',
          'sys',
          'timers',
          'tty',
          'url',
          'util',
          'vm',
          'zlib'
        ]
      })
    ],
    configure: (webpackConfig) => {
      const moduleScopePlugin = webpackConfig.resolve.plugins.find(
        (plugin) => plugin instanceof ModuleScopePlugin
      );
      moduleScopePlugin.allowedPaths.push(
        path.resolve(
          __dirname, 
          "node_modules/@vanilla-extract/webpack-plugin"
        )
      );

      return webpackConfig;
    },
  }
}
