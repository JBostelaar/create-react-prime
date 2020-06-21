import * as i from 'types';
import { injectable, inject } from 'inversify';
import commander from 'commander';
import SERVICES from 'ioc/services';
import { ARG, REPOSITORIES } from './constants';

@injectable()
export default class CLIMgr implements i.CLIMgrType {
  @inject(SERVICES.CLI) readonly cli!: commander.Command;
  _projectName?: string;


  get installRepository(): string {
    return REPOSITORIES[this.installType];
  }

  /** These values come from option flags, i.e. --type */
  get installType(): i.InstallerTypes {
    return this.cli.type;
  }

  /** Args are passed without an option flag, i.e. the project name */
  get projectName(): string {
    if (this._projectName) {
      return this._projectName;
    }

    return this.args[ARG.PROJECT_NAME];
  }

  set projectName(name: string) {
    this._projectName = name;
  }

  get isDebugging(): boolean | undefined {
    return this.cli.debug;
  }

  get skipSteps(): Promise<i.InstallStepId[] | undefined> {
    const skipStepsList = (this.cli.skipSteps || []) as Promise<i.InstallStepId>[];
    const resolveStepsList: Promise<i.InstallStepId>[] = [];
    let step: Promise<i.InstallStepId>;

    for (step of skipStepsList) {
      const resolveStep = Promise.resolve(step);
      resolveStepsList.push(resolveStep);
    }

    return Promise.all(resolveStepsList);
  }

  private get args(): string[] {
    return this.cli.args;
  }
}
