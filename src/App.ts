import fs from 'fs';
import path from 'path';
import * as i from 'types';
import { injectable, inject } from 'inversify';
import container from 'ioc';
import SERVICES from 'ioc/services';
import Text from 'utils/Text';


@injectable()
export default class App implements i.AppType {
  private installer!: i.InstallerType;

  constructor(
    @inject(SERVICES.CLIMgr) private readonly cliMgr: i.CLIMgrType,
    @inject(SERVICES.Logger) private readonly logger: i.LoggerType,
  ) {}


  async install(): Promise<void> {
    const { projectName, installType } = this.cliMgr;

    // Get installer for the type that was specified by the user
    this.installer = container.getNamed(SERVICES.Installer, installType!);

    // Prepare installer environment
    this.installer.init();

    // Check if directory already exists to prevent overwriting existing data
    if (fs.existsSync(projectName!)) {
      this.logger.error(`directory '${projectName}' already exists.`);
    }

    // Start the installation process
    try {
      await this.installer.install();
    } catch (err) {
      this.logger.error(err);
    }

    this.logger.whitespace();
  }

  async form(type: 'pre' | 'post'): Promise<void> {
    const questions = container.getNamed<i.QuestionsType>(SERVICES.Questions, type);

    // Prompt questions for user
    const answers = await questions.ask();

    // Act upon the given answers
    await questions.answer(answers);

    if (Object.keys(answers).length > 0) {
      this.logger.whitespace();
    }
  }

  end(): void {
    const text = new Text();
    const { installationConfig, installationLangConfig } = this.cliMgr;
    const projectPath = path.resolve(this.cliMgr.projectName!);
    const styledProjectName = text.yellow(text.bold(this.cliMgr.projectName!));
    const styledRepoName = text.gray(`(${installationConfig?.repository})`);

    this.logger.msg(`${styledProjectName} ${styledRepoName} was succesfully installed at ${text.cyan(projectPath)}.`);

    function formatText(cmd: string, desc: string): string {
      return `  ${cmd.padEnd(15)} ${text.gray(desc)}`;
    }

    /* eslint-disable no-console */
    console.log(`\n${text.title('Quickstart')}\n`);
    console.log(`  cd ${this.cliMgr.projectName}`);
    for (const str of installationLangConfig.instructions.quickstart) {
      console.log(`  ${str}`);
    }

    console.log(`\n${text.title('All commands')}\n`);
    for (const str of installationLangConfig.instructions.allCommands) {
      console.log(formatText(str.cmd, str.desc));
    }
    /* eslint-enable */
  }
}
