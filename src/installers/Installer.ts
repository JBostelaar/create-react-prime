import fs from 'fs';
import util from 'util';
import path from 'path';
import cp from 'child_process';
import ora from 'ora';
import App from '../App';
import { TEXT, ORGANIZATION } from '../constants';
import { PackageJson } from '../types';
import InstallConfig from '../InstallConfig';
import InstallStep, { InstallStepArgs } from '../InstallStep';
import INSTALL_STEP from '../InstallStep/steps';

const writeFile = util.promisify(fs.writeFile);
const exec = util.promisify(cp.exec);

export default abstract class Installer {
  private installSteps: InstallStep[] = [];
  private stepNum = 0;

  constructor() {
    const { projectName, installerName } = InstallConfig;

    this
      .addInstallStep({
        id: INSTALL_STEP.CLONE,
        emoji: '🚚',
        message: `Cloning ${installerName} into '${projectName}'...`,
        cmd: `git clone https://github.com/${ORGANIZATION}/${installerName}.git ${projectName}`,
      })
      .addInstallStep({
        id: INSTALL_STEP.UPDATE_PACKAGE,
        emoji: '✏️ ',
        message: 'Updating package...',
        fn: this.updatePackage.bind(this),
      })
      .addInstallStep({
        id: INSTALL_STEP.NPM_INSTALL,
        emoji: '📦',
        message: 'Installing packages...',
        cmd: `npm --prefix ${projectName} install`,
      })
      .addInstallStep({
        id: INSTALL_STEP.CLEANUP,
        emoji: '🧹',
        message: 'Cleaning up...',
        cmd: `rm -rf ${projectName}/.git ${projectName}/.travis.yml`,
        fn: this.cleanup.bind(this),
      });
  }


  // Starts the installation process. This is async.
  // Returns the installation promise.
  async start(): Promise<void> {
    await this.install();

    // eslint-disable-next-line no-console
    console.log(
      `⚡️ ${TEXT.BOLD} Succesfully installed ${InstallConfig.installerName}! ${TEXT.DEFAULT}`,
    );
  }


  // Returns the current installation step
  protected getStep(): InstallStep {
    return this.installSteps[this.stepNum];
  }

  // Installers can add additional installation steps with this function
  protected addInstallStep(args: InstallStepArgs, atIndex?: number): this {
    const installStep = new InstallStep(args);

    if (typeof atIndex === 'number') {
      this.installSteps.splice(atIndex, 0, installStep);
    } else {
      this.installSteps.push(installStep);
    }

    return this;
  }

  protected getProjectNpmPackage(): { path: string; json: PackageJson } {
    const projectPkgPath = path.resolve(`${InstallConfig.projectName}/package.json`);
    const pkgFile = fs.readFileSync(projectPkgPath, 'utf8');

    if (!pkgFile) {
      App.exitSafely('No valid NPM package found in getProjectNpmPackage');
    }

    return {
      path: projectPkgPath,
      json: JSON.parse(pkgFile),
    };
  }

  protected async writeToPackage(npmPkg: PackageJson): Promise<void> {
    const { path } = this.getProjectNpmPackage();

    await writeFile(path, JSON.stringify(npmPkg, null, 2));
  }

  // Promisify spawns
  // util.promisfy doesn't work
  protected asyncSpawn(command: string, args: string[], options?: { path: string }): Promise<void> {
    const opts = {
      // Execute in given folder path with cwd
      cwd: options?.path || path.resolve(InstallConfig.projectName),
    };

    return new Promise((resolve, reject) => {
      cp.spawn(command, args, opts)
        .on('close', resolve)
        .on('error', reject);
    });
  }

  // Resets certain node package variables
  // Can provide a node package object as parameter
  protected async updatePackage(npmPkg?: PackageJson): Promise<void> {
    const { projectName } = InstallConfig;
    const pkg = npmPkg || this.getProjectNpmPackage().json;

    // Overwrite boilerplate defaults
    pkg.name = projectName;
    pkg.version = '0.0.1';
    pkg.description = `Code for ${projectName}.`;
    pkg.author = 'Label A [labela.nl]';
    pkg.keywords = [];

    if (pkg.repository != null && typeof pkg.repository === 'object') {
      pkg.repository.url = '';
    }

    await this.writeToPackage(pkg);
  }

  // Override method
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected async cleanup(): Promise<void> {}


  // This runs through all the installation steps
  private async install() {
    const iter = async () => {
      const step = this.getStep();
      const spinner = ora(step.message).start();

      try {
        // Run the installation step
        await this.installation(step);

        spinner.succeed();
      } catch (err) {
        spinner.fail();
      }

      // Go to next step or end the installation
      if (this.stepNum++ >= this.installSteps.length - 1) {
        return;
      }

      await iter();
    };

    // Start iterating through the installation steps
    await iter();
  }

  // Single installation step
  private async installation(step: InstallStep) {
    try {
      if (step.cmd) {
        const step = this.getStep();

        // Execute command line
        await exec(step.cmd!);

        // Execute function if exists
        await step.fn?.();
      } else if (step.fn) {
        await step.fn();
      } else {
        App.exitSafely('Every install step is required to have either "cmd" or "fn".');
      }
    } catch (err) {
      throw new Error(err);
    }
  }
}
