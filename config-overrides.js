const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = function override(config, env) {
  config.plugins.push(
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
  )
  return config
}
