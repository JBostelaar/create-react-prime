import commander, { Command } from 'commander';
import Validate from 'utils/Validate';
import Logger from 'utils/Logger';
import { installerCfg } from './installers/config';
import { INSTALL_STEP } from './installers/steps';
import { ARG, ERROR_TEXT } from './constants';

function initCLI(): commander.Command {
  // Initiate cli program
  const cli = new Command();

  // Set options
  const installStepIdList = INSTALL_STEP.join(', ');

  cli.option(
    '-t, --type <type>',
    `Install a type of react-prime. Options: ${installerCfg.map((cfg) => cfg.name).join(', ')}`,
  );

  cli.option(
    '-d, --debug',
    'Show additional information when running the installer',
    false,
  );

  cli.option(
    '-s, --skipSteps <steps>',
    `Skip an install step. You can pass a comma separated list for multiple steps. Options: ${installStepIdList}`,
    // Map from comma separated string list to array
    (value) => {
      const skipSteps = value.replace(' ', '').split(',');
      const invalidSteps: string[] = [];

      // Check if any of the given steps is invalid
      for (const step of skipSteps) {
        // Given step can !== stepId, that's the point of this check!
        // @ts-ignore
        const invalidStep = !INSTALL_STEP.includes(step);

        if (invalidStep) {
          invalidSteps.push(step);
        }
      }

      if (invalidSteps.length > 0) {
        const stepsToStr = invalidSteps
          .map((str) => `'${str}'`)
          .join(', ');

        console.error(
          `Error in --skipSteps. ${stepsToStr} is/are invalid. Available steps: ${installStepIdList}`,
        );

        process.exit(1);
      }

      return skipSteps;
    },
    [],
  );

  cli.option(
    '-y, --yes',
    'Skip all optional questions',
    false,
  );

  // Set other variables
  cli.version('$version');
  cli.parse(process.argv);

  // Validate project name
  if (cli.args[ARG.ProjectName] != null) {
    const logger = new Logger();
    const validate = new Validate();

    if (!validate.filename(cli.args[ARG.ProjectName])) {
      logger.error(ERROR_TEXT.Filename);
      process.exit(1);
    }
  }

  return cli;
}

export default initCLI;
