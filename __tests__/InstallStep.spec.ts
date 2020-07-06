import 'reflect-metadata';
import * as i from 'types';
import InstallStep from 'src/InstallStep';

describe('InstallStep', () => {
  const ctx = new class {
    readonly opts: i.InstallStepOptions = {
      message: {
        pending: 'pending test',
        success: 'success test',
      },
      emoji: '🧪',
      id: 'clone',
      cmd: 'cmd line script',
      fn: async () => void {},
    };

    readonly step1 = new InstallStep(this.opts);
    readonly step2 = new InstallStep(this.opts, this.step1);
  };

  it('Returns correct values from getters', () => {
    expect(ctx.step1.cmd).toEqual('cmd line script');
    expect(ctx.step1.message).toEqual({
      pending: '🧪  pending test',
      success: '🧪  success test',
    });
    expect(ctx.step1.options).toEqual(ctx.opts);
  });

  it('Correctly executes the function', async () => {
    const mockFn = jest.fn(ctx.step1.fn!);

    await mockFn();

    // Executed once
    expect(mockFn.mock.calls.length).toBe(1);

    // Return a promise without value
    expect(mockFn.mock.results[0].value).toEqual(Promise.resolve({}));
  });

  it('Returns the next step', () => {
    expect(ctx.step1.next).toEqual(ctx.step2);
    expect(ctx.step2.next).toBeUndefined();

    const step3 = new InstallStep(ctx.opts, ctx.step2, ctx.step1);

    expect(step3.next).toEqual(ctx.step1);
  });

  it('Returns the previous step', () => {
    expect(ctx.step1.previous).toBeUndefined();
    expect(ctx.step2.previous).toEqual(ctx.step1);

    const step3 = new InstallStep(ctx.opts, ctx.step2, ctx.step1);

    expect(step3.previous).toEqual(ctx.step2);
  });
});
