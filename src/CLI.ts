import * as i from 'types';
import commander, { Command } from 'commander';
import Validate from 'utils/Validate';
import Logger from 'utils/Logger';
import { installationConfig } from './installers/config';
import { INSTALL_STEP } from './installers/steps/identifiers';
import { ARG, ERROR_TEXT } from './constants';


export default function initCLI(): commander.Command {
  const logger = new Logger();

  // Initiate cli program
  const cli = new Command();

  // Set options
  const installStepIdList = INSTALL_STEP.join(', ');

  const repos: string[] = [];
  const langs: string[] = [];

  let lang: i.InstallLang;
  for (lang in installationConfig) {
    langs.push(lang);

    for (const repo in installationConfig[lang]) {
      repos.push(repo);
    }
  }

  cli.option(
    '-l, --lang <lang>',
    `What programming language you will use. Options: ${langs.join(', ')}`,
    'js',
  );

  cli.option(
    '-t, --type <type>',
    `Install given boilerplate. Options: ${repos.join(', ')}`,
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

        logger.error(
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
    const validate = new Validate();

    if (!validate.filename(cli.args[ARG.ProjectName])) {
      logger.error(ERROR_TEXT.Filename);
      process.exit(1);
    }
  }

  return cli;
}
