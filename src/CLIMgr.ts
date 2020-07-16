import * as i from 'types';
import { injectable, inject } from 'inversify';
import commander from 'commander';
import SERVICES from 'ioc/services';
import { installerCfg } from 'installers/config';
import { ARG } from './constants';


@injectable()
export default class CLIMgr implements i.CLIMgrType {
  private _projectName?: string;

  constructor(
    @inject(SERVICES.CLI) readonly cli: commander.Command,
  ) {}


  get installRepository(): string | undefined {
    return installerCfg
      .find((cfg) => this.installType === cfg.name)
      ?.repository;
  }

  /** These values come from option flags, i.e. --type */
  get installType(): i.InstallType | undefined {
    return this.cli.type;
  }

  set installType(type: i.InstallType | undefined) {
    this.cli.type = type;
  }

  /** Args are passed without an option flag, i.e. the project name */
  get projectName(): string | undefined {
    return this._projectName || this.args[ARG.ProjectName];
  }

  set projectName(name: string | undefined) {
    this._projectName = name;
  }

  get isDebugging(): boolean {
    return this.cli.debug;
  }

  get skipSteps(): i.InstallStepIds[] {
    return this.cli.skipSteps;
  }

  get skipOptionalQuestions(): boolean {
    return this.cli.yes;
  }

  private get args(): string[] {
    return this.cli.args;
  }
}
