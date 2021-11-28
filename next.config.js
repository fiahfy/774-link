const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

/** @type {import('next').NextConfig} */
module.exports = {
  /**
   * Material UI V4 is not React Strict Mode compatible.
   * @see https://github.com/mui-org/material-ui/issues/18018
   */
  // reactStrictMode: true,
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
