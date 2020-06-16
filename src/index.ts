import { program } from 'commander';
import pkg from '../package.json';
import App from './App';
import InterfaceMgr from './InterfaceMgr';
import { TYPE } from './constants';
import INSTALL_STEP from './InstallStep/steps';

// Commander has to be initialized at the very start of the application
// It is then passed along to InterfaceMgr

// Set options
program
  .option(
    '-t, --type <type>',
    `Install a type of react-prime. Options: ${Object.values(TYPE).join(', ')}`,
    TYPE.CLIENT,
  )
  .option(
    '-d, --debug',
    'Show additional information when running the installer.',
  )
  .option(
    '-s, --skipSteps <steps>',
    // eslint-disable-next-line max-len
    `Skip an install step. You can pass a comma separated list for multiple steps. Options: ${Object.keys(INSTALL_STEP).join(', ')}`,
    // Map from comma separated string list to array
    (value) => {
      const stepsStr = Object.keys(INSTALL_STEP);

      return value
        .replace(' ', '')
        .split(',')
        .map((id) => {
          if (!stepsStr.includes(id)) {
            throw new Error(`'${id}' is not a valid step ID. See --help for available options.`);
          }

          return id;
        });
    },
  );

// Set other variables
program
  .version(pkg.version)
  .parse(process.argv);


// Initialize our interface handler
const interfaceMgr = new InterfaceMgr(program);

// Start app
new App(interfaceMgr);
