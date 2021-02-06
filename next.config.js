const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

module.exports = {
  /**
   * @see https://dev.to/chromygabor/add-typescript-type-check-to-next-js-2nbb
   * @see https://github.com/vercel/next.js/issues/14997
   */
  webpack(config, options) {
    const { dev, isServer } = options

    if (dev && isServer) {
      config.plugins.push(new ForkTsCheckerWebpackPlugin())
    }

    return config
  },
}
