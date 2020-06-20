import * as i from 'types';
import InstallStep from '../InstallStep';
import InstallStepList from '../InstallStepList';

export type AppType = {
  start(): Promise<void>;
}

export type CLIMgrType = {
  projectName: string;
  installType: i.InstallerTypes;
  installRepository: string;
  isDebugging: boolean | undefined;
};

export type LoggerType = {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  warning(...reason: any[]): void;
  error(...str: any[]): void;
  debug(...reason: any[]): void;
  /* eslint-enable */
}

export type InstallerType = {
  init(): void;
  install(): Promise<void>;
}

export type InstallStepType = {
  id: symbol;
  message: string;
  cmd: string | undefined;
  fn: (() => Promise<void>) | undefined;
  previous: InstallStep | undefined;
  next: InstallStep | undefined;
}

export type InstallStepListType = InstallStepType[] & {
  first: InstallStep | undefined;
  last: InstallStep | undefined;
  add(stepOptions: i.InstallStepOptions): InstallStepList;
  addAfterStep(stepId: i.InstallStepId, stepOptions: i.InstallStepOptions): InstallStepList;
  modifyStep(stepId: i.InstallStepId, stepOptions: Partial<i.InstallStepOptions>): InstallStepList;
}
