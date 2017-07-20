'use strict'; // eslint-disable-line strict


// UI & TinyMCE
const mainConfig = require('@nyt-cms/webpack-config-nyt-cms/webpack.main.build.config');
const tinymceConfig = require('@nyt-cms/webpack-config-nyt-cms/webpack.tinymce.build.config');
const setupProgress = require('@nyt-cms/webpack-config-nyt-cms/setup-progress');

const config = [mainConfig, tinymceConfig];

setupProgress(config);

module.exports = config;


// // Replace with this for Just UI
// const mainConfig = require('@nyt-cms/webpack-config-nyt-cms/webpack.main.config');
// const setupProgress = require('@nyt-cms/webpack-config-nyt-cms/setup-progress')
//
// setupProgress(mainConfig);
//
// module.exports = mainConfig;


// Tweak config here
