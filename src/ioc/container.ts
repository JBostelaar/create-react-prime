import 'reflect-metadata';
import * as i from 'types';
import { Container } from 'inversify';
import commander from 'commander';
import ClientInstaller from 'installers/Client';
import SsrInstaller from 'installers/Ssr';
import NativeInstaller from 'installers/Native';
import InstallStepList from 'InstallStepList';
import App from '../App';
import prepareCLI from '../CLI';
import CLIMgr from '../CLIMgr';
import Logger from '../Logger';
import SERVICES from './services';

const container = new Container();

async function prepareContainer(): Promise<Container> {
  const CLI = await prepareCLI();

  container.bind<i.LoggerType>(SERVICES.Logger).to(Logger);
  container.bind<i.AppType>(SERVICES.App).to(App);
  container.bind<commander.Command>(SERVICES.CLI).toConstantValue(CLI);
  container.bind<i.CLIMgrType>(SERVICES.CLIMgr).to(CLIMgr).inSingletonScope();
  container.bind<i.InstallStepListType>(SERVICES.InstallStepList).to(InstallStepList);
  container.bind<i.InstallerType>(SERVICES.Installer.client).to(ClientInstaller);
  container.bind<i.InstallerType>(SERVICES.Installer.ssr).to(SsrInstaller);
  container.bind<i.InstallerType>(SERVICES.Installer.native).to(NativeInstaller);

  return container;
}

export { prepareContainer };
export default container;
