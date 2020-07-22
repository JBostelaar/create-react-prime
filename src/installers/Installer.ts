import util from 'util';
import cp from 'child_process';
import * as i from 'types';
import { injectable, inject } from 'inversify';
import ora from 'ora';
import container from 'ioc';
import SERVICES from 'ioc/services';
import { LOG_PREFIX } from '../constants';


// Wrap utils in promise
const exec = util.promisify(cp.exec);


@injectable()
export default class Installer implements i.InstallerType {
  private spinner = ora();

  constructor(
    @inject(SERVICES.CLIMgr) protected readonly cliMgr: i.CLIMgrType,
    @inject(SERVICES.Logger) protected readonly logger: i.LoggerType,
    @inject(SERVICES.InstallStepList) protected readonly installStepList: i.InstallStepListType,
    @inject(SERVICES.PackageMgr) protected readonly packageMgr: i.PackageMgrType,
  ) {}


  init(): void {
    this.initSteps();
  }

  /**
   * Start installation process by iterating through all the installation steps
   */
  async install(): Promise<void> {
    // Debug
    if (this.cliMgr.isDebugging) {
      for (const step of this.installStepList) {
        this.logger.debug({
          msg: step.message,
          next: step.next?.message,
        });
      }
    }

    let step = this.installStepList.first;

    const iter = async () => {
      // Ends the installation
      if (!step) {
        return;
      }

      const { skipSteps } = this.cliMgr;
      const skipStep = skipSteps?.some((id) => id === step?.id);

      if (!skipStep) {
        this.spinner = ora(step.message.pending);
        this.spinner.prefixText = LOG_PREFIX;
        this.spinner.start();

        try {
          // Run the installation step
          await this.executeStep(step);

          this.spinner.succeed(step.message.success);
        } catch (err) {
          this.error(err);
        }
      } else {
        this.logger.warning(`Skipped '${step.message.pending}'`);
      }

      // Go to next step
      step = step.next;

      await iter();
    };

    // Start iterating through the installation steps
    await iter();
  }


  /**
   * Updates node package variables
   */
  protected updatePackage(): void {
    this.packageMgr.update();
  }

  /**
   * Add the basic installation steps. Can be overloaded to add or modify steps.
   */
  protected initSteps(): void {
    const baseSteps = container.getNamed<i.StepsType>(SERVICES.Steps, this.cliMgr.lang);

    for (const baseStep of baseSteps) {
      // Convert the name of a function into the reference of the function
      if (typeof baseStep.fn === 'string') {
        // Errors, because using 'string' to index 'this' returns 'any', but we don't care
        // @ts-ignore
        const fn = this[baseStep.fn];

        // Bind 'this' to the installer instance
        if (typeof fn === 'function') {
          baseStep.fn = fn.bind(this);
        }
      }

      this.installStepList.add(baseStep);
    }
  }


  /**
   * Run the installation step
   */
  private async executeStep(step: i.InstallStepType): Promise<void> {
    try {
      // Execute command line
      if (step.cmd) {
        await exec(step.cmd);
      }

      // Execute function
      if (step.fn) {
        await step.fn();
      }
    } catch (err) {
      this.error(err);
    }
  }

  private error(...reason: i.AnyArr): void {
    this.spinner.fail();
    this.logger.error(...reason);
  }
}
