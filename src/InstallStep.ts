import * as i from 'types';

export default class InstallStep implements i.InstallStepType {
  private _message = {} as i.InstallMessage;

  constructor(
    private _options: i.InstallStepOptions,
    private _previous?: InstallStep,
    private _next?: InstallStep,
  ) {
    // Combine emoji with every status message
    let status: keyof i.InstallMessage;
    for (status in _options.message) {
      this._message[status] = `${_options.emoji}  ${_options.message[status]}`;
    }

    if (_previous) {
      _previous._next = this;
    }
  }


  get options(): i.InstallStepOptions {
    return this._options;
  }

  get id(): i.InstallStepIds {
    return this._options.id;
  }

  get message(): i.InstallMessage {
    return this._message;
  }

  get cmd(): string | undefined {
    return this._options.cmd;
  }

  get fn(): i.PromiseFn | undefined {
    return this.options.fn as i.PromiseFn | undefined;
  }

  get previous(): InstallStep | undefined {
    return this._previous;
  }

  get next(): InstallStep | undefined {
    return this._next;
  }

  modify(stepOptions: Partial<i.InstallStepOptions> | ((step: InstallStep) => Partial<i.InstallStepOptions>)): this {
    if (typeof stepOptions === 'object') {
      this._options = {
        ...this.options,
        ...stepOptions,
      };

      return this;
    }

    const options = stepOptions(this);

    this._options = {
      ...this.options,
      ...options,
    };

    return this;
  }
}
