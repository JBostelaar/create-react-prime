import * as i from 'types';
import STEPS from 'installers/steps/identifiers';
import Installer from './Installer';
import Steps from './steps/Steps';

export type InstallLangs = 'js';
export type InstallTypes = 'client' | 'ssr' | 'native';

export type InstallStepIds = i.ValueOf<typeof STEPS>;

export type InstallMessage = {
  pending: string;
  success: string;
  fail?: string;
};

type InstallStepOptionsBase = {
  /** Unique identifier for this step. */
  id: InstallStepIds;
  /** Message displayed when this step is being executed and is done executing. */
  message: InstallMessage;
  /** Emoji displayed between spinner and message. */
  emoji: string;
}

type InstallStepOptionsCmd = {
  /** Used for command line scripts. */
  cmd: string;
  fn?: string | i.PromiseFn;
}

type InstallStepOptionsFn = {
  cmd?: string;
  /**
   * Used for anything that should be executed with JavaScript,
   * or is easier to translate into JavaScript rather than a command line script.
   * Can be used together with a command line script from `cmd`. This function will always run
   * after the command line script is finished executing.
   *
   * Can either be a direct reference to a function,
   * or a name reference to any method from an Installer instance as string.
   */
  fn: string | i.PromiseFn;
}

// This type makes sure least one of 'cmd' or 'fn' is present
export type InstallStepOptions = InstallStepOptionsBase & (
  | InstallStepOptionsCmd
  | InstallStepOptionsFn
);

export type Vc = {
  host: string;
  owner: string;
}

export type InstallationConfig = {
  name: string;
  repository: string;
  vc: i.Vc;
  description: string;
  installer: typeof Installer;
}

export type LangConfig = {
  steps: typeof Steps;
  instructions: {
    quickstart: string[];
    allCommands: {
      cmd: string;
      desc: string;
    }[];
  };
  type: {
    [type: string]: i.InstallationConfig;
  };
};

export type InstallersConfig = {
  [lang: string]: i.LangConfig;
}
