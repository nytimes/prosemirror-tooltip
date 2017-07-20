'use strict'; // eslint-disable-line strict

// UI & TinyMCE
const testConfig = require('@nyt-cms/webpack-config-nyt-cms/webpack.test.config');
const setupProgress = require('@nyt-cms/webpack-config-nyt-cms/setup-progress');

const config = testConfig;

setupProgress(config);

module.exports = config;


// // Replace with this for Just UI
// const mainConfig = require('@nyt-cms/webpack-config-nyt-cms/webpack.main.config');
// const devServerConfig = require('@nyt-cms/webpack-config-nyt-cms/webpack-dev-server.config');
// const setupProgress = require('@nyt-cms/webpack-config-nyt-cms/setup-progress')
//
// setupProgress(mainConfig);
//
// mainConfig.devServer = devServerConfig;
//
// module.exports = mainConfig;


// Tweak config here
