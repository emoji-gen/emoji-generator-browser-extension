'use strict';

import * as karma from 'karma';
import { omit } from 'lodash';

module.exports = (config: karma.Config) => {
  config.set({
    autoWatch: true,
    basePath: '',
    browsers: ['ChromeHeadless'],
    colors: true,
    concurrency: Infinity,
    exclude: [],
    frameworks: ['mocha', 'webpack'],
    files: ['test/**/*.ts'],
    logLevel: config.LOG_INFO,
    mime: {
      'text/x-typescript': ['ts', 'tsx'],
    },
    port: 9876,
    preprocessors: {
      'test/**/*.ts': ['webpack'],
    },
    reporters: ['progress'],
    singleRun: false,
    webpack: omit(require('./webpack.config'), ['entry', 'output']),
    webpackMiddleware: {
      noInfo: true,
    },
  });
};
