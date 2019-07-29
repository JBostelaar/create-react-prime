#!/usr/bin/env node
/* eslint-disable no-console */

require('./polyfill');
const { TEXT } = require('./constants');
const { name, boilerplateNameAffix } = require('./installConfig');
const install = require('./install');
const runSpawns = require('./runSpawns');

/*
  Start install process
*/
install()
  .then(runSpawns)
  .finally(() => {
    console.log(
      `⚡️ ${TEXT.BOLD} Succesfully installed ${name}${boilerplateNameAffix}! ${TEXT.DEFAULT}`
    );

    process.exit();
  });

/* eslint-enable no-console */
