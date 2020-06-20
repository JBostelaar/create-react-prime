import { injectable, inject } from 'inversify';
import commander from 'commander';
import { CLIMgrType } from './ioc';
import SERVICES from './ioc/services';
import { ARG, REPOSITORIES } from './constants';
import { InstallerTypes } from './types';

@injectable()
export default class CLIMgr implements CLIMgrType {
  @inject(SERVICES.CLI) readonly cli!: commander.Command;
  _projectName?: string;


  get installRepository(): string {
    return REPOSITORIES[this.installType];
  }

  /** These values come from option flags, i.e. --type */
  get installType(): InstallerTypes {
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

  private get args(): string[] {
    return this.cli.args;
  }
}
