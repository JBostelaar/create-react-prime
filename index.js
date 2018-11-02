#!/usr/bin/env node

var program = require('commander');
var cmd = require('node-cmd');
var fs = require('fs');
var Promise = require('bluebird');
var pkg = require('./package.json');

program
  .version(pkg.version)
  .parse(process.argv);

var projectName = program.args[0] || 'react-prime';

if (fs.existsSync(projectName)) {
  return console.error(`Error: directory '${projectName}' already exists.`);
}

var commands = [
  `git clone https://github.com/JBostelaar/react-prime.git ${projectName}`,
  `cd ${projectName}`,
  'rm -rf .git',
  'npm i',
].join(' && ');

cmd.run(commands);

console.log('Installing...');
