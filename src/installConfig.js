const fs = require('fs');
const { ARG, TYPE } = require('./constants');
const program = require('./program');
const boilerplates = require('./boilerplates');

// Repository selector
const boilerplate = boilerplates[program.type];

// Options to add when cloning
let cloneOptions = '';

if (program.typescript) {
  // Only client has a TypeScript branch
  if (program.type !== TYPE.CLIENT) {
    console.error(`Error: TypeScript can only be installed with the '${TYPE.CLIENT}' type.`);
    process.exit();
  }

  cloneOptions = '--single-branch --branch typescript';
}


// Project folder name. Defaults to repository name.
const projectName = program.args[ARG.PROJECT_NAME] || boilerplate.name;

// Check if directory already exists to prevent overwriting existing data
if (fs.existsSync(projectName)) {
  return console.error(`Error: directory '${projectName}' already exists.`);
}


module.exports = {
  name: boilerplate.name,
  author: boilerplate.author,
  cloneOptions,
  projectName,
};