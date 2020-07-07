import * as i from 'types';
import { injectable, inject } from 'inversify';
import SERVICES from 'ioc/services';
import { LOG_PREFIX } from '../constants';
import Text from './Text';

@injectable()
export default class Logger implements i.LoggerType {
  private text = new Text();

  constructor(
    @inject(SERVICES.CLIMgr) private readonly cliMgr: i.CLIMgrType,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warning(...reason: any[]): void {
    this.log({ prefix: 'WARNING', color: 'yellow' }, ...reason);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(...reason: any[]): void {
    this.log({ prefix: 'ERR!' }, 'Installation aborted.', ...reason);
    process.exit(1);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(...text: any[]): void {
    if (this.cliMgr.isDebugging) {
      this.log({ prefix: 'DEBUG' }, ...text);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private log(options: LogOptions, ...str: any[]): void {
    const color = options.color ? this.text[options.color] : this.text.red;

    // eslint-disable-next-line no-console
    console.log(`${LOG_PREFIX} ${color(`${options.prefix}`)}`, ...str);
  }
}

type LogOptions = {
  prefix: string;
  color?: Exclude<keyof Text, 'style' | 'bold'>;
}
