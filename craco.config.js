const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      const defaultEntry = webpackConfig.entry;
      let popupEntryArray = [];
      if (typeof defaultEntry === 'string') {
        popupEntryArray = [defaultEntry];
      } else if (Array.isArray(defaultEntry)) {
        popupEntryArray = defaultEntry;
      } else {
        console.warn("CRACO: Unexpected webpack entry format. Assuming first entry value is the main app.");
        const mainEntryValue = Object.values(defaultEntry)[0];
        popupEntryArray = typeof mainEntryValue === 'string' ? [mainEntryValue] : mainEntryValue;
      }

      webpackConfig.entry = {
        main: popupEntryArray,
        content: path.resolve(paths.appSrc, 'chrome/content.js'),
        serviceWorker: path.resolve(paths.appSrc, 'chrome/serviceWorker.js'),
      };

      const originalOutputFilename = webpackConfig.output.filename;
      webpackConfig.output.filename = (pathData) => {
        if (pathData.chunk.name === 'content') {
          return 'content.js';
        }
        if (pathData.chunk.name === 'serviceWorker') {
          return 'serviceWorker.js';
        }
        if (typeof originalOutputFilename === 'function') {
          return originalOutputFilename(pathData);
        }
        return originalOutputFilename;
      };

      const htmlWebpackPluginInstance = webpackConfig.plugins.find(
        plugin => plugin.constructor.name === 'HtmlWebpackPlugin'
      );
      if (htmlWebpackPluginInstance) {
        htmlWebpackPluginInstance.options.chunks = ['main'];
      }

      if (webpackConfig.optimization) {
        webpackConfig.optimization.runtimeChunk = false;
      }

      // To forcefully disable sourcemaps if not using the environment variable:
      // if (env === 'production') { // Or always: webpackConfig.devtool = false;
      //   webpackConfig.devtool = false;
      // }

      return webpackConfig;
    },
  },
};