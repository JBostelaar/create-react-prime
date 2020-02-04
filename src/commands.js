/* eslint-disable no-console */
const path = require('path');
const { spawn } = require('child_process');
const updatePackage = require('./updatePackage');
const { name, owner, projectName } = require('./installConfig');
const { TYPE } = require('./constants');
const program = require('./program');

/*
  All commands needed to run to guarantee a successful and clean installation
*/
const commands = [
  {
    cmd: `git clone https://github.com/${owner}/${name}.git ${projectName}`,
    message: `🚚  Cloning ${name} into '${projectName}'...`,
    time: 3000,
  },
  {
    cmd: `npm --prefix ${projectName} install`,
    message: '📦  Installing packages...',
    time: 40000,
  },
  {
    cmd: `rm -rf ${projectName}/.git ${projectName}/.travis.yml`,
    fn: () => updatePackage(projectName),
    message: '🔨  Preparing...',
    time: 50,
  },
];

/*
  All commands that need a spawn execute
*/
const spawnCommands = {
  [TYPE.NATIVE]: [
    {
      message: `🔤  Renaming project files to '${projectName}'...`,
      time: 10000,
      fn: (cb) => {
        if (program.type === TYPE.NATIVE) {
          // React-native does not allow non-alphanumeric characters in project name
          const validProjectName = projectName.replace(/\W/g, '');

          const options = {
            // Execute in project folder with cwd
            cwd: path.resolve(validProjectName),
          };

          let done = 0;

          const isDone = () => {
            if (++done === 3) {
              cb();
            }
          };

          spawn('npm', ['run', 'renameNative'], options)
            .on('close', isDone);

          spawn('npm', ['run', 'replaceWithinFiles'], options)
            .on('close', isDone);

          spawn('npm', ['run', 'replaceSchemeFilenames'], options)
            .on('close', isDone);
        }
      },
    },
  ],
};

module.exports = {
  commands,
  spawnCommands,
};

/* eslint-enable no-console */
