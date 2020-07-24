import 'reflect-metadata';
import * as i from 'types';
import InstallStepList from 'src/InstallStepList';
import Logger from 'src/utils/Logger';
import STEPS from 'installers/steps/identifiers';
import createCliCtx from './utils/createCliCtx';
import mockConsole from './utils/mockConsole';

describe('InstallStepList', () => {
  const restoreConsole = mockConsole();

  const ctx = new class {
    get logger() {
      return new Logger();
    }

    createStepList() {
      const { cliMgr } = createCliCtx();

      return new InstallStepList(this.logger, cliMgr);
    }

    stepOptions(id?: i.InstallStepIds): i.InstallStepOptions {
      return {
        message: {
          pending: 'pending test',
          success: 'success test',
        },
        emoji: '🧪',
        id: id || STEPS.Clone,
        cmd: 'cmd line script',
        fn: async () => void {},
      };
    }
  };

  afterAll(() => {
    restoreConsole();
  });

  it('Is an array', () => {
    expect(Array.isArray(ctx.createStepList())).toEqual(true);
  });

  it('Starts empty', () => {
    expect(ctx.createStepList()).toHaveLength(0);
  });

  it('Returns the first in the list', () => {
    const stepList = ctx.createStepList()
      .add(ctx.stepOptions(STEPS.Clone))
      .add(ctx.stepOptions(STEPS.NpmInstall));

    expect(stepList.first?.id).toEqual(STEPS.Clone);
  });

  it('Returns the last in the list', () => {
    const stepList = ctx.createStepList()
      .add(ctx.stepOptions(STEPS.Clone))
      .add(ctx.stepOptions(STEPS.NpmInstall));

    expect(stepList.last?.id).toEqual(STEPS.NpmInstall);
  });

  it('Can add a step to the end of the list', () => {
    // List only has a single entry
    const stepList = ctx.createStepList()
      .add(ctx.stepOptions(STEPS.Clone));

    expect(stepList).toHaveLength(1);
    expect(stepList.first?.previous).toBeUndefined();
    expect(stepList.last?.next).toBeUndefined();

    // Additional steps are added at the end of the list
    stepList.add(ctx.stepOptions(STEPS.NpmInstall));

    expect(stepList).toHaveLength(2);
    expect(stepList.last?.id).toEqual(STEPS.NpmInstall);

    // 'previous' and 'next' references are updated
    expect(stepList.last?.previous?.id).toEqual(STEPS.Clone);
    expect(stepList.first?.next?.id).toEqual(STEPS.NpmInstall);
  });

  it('Can add a step at any position in the list', () => {
    const stepList = ctx.createStepList()
      .add(ctx.stepOptions(STEPS.Clone))
      .add(ctx.stepOptions(STEPS.NpmInstall))
      .add(ctx.stepOptions(STEPS.Cleanup));

    stepList.addAfterStep(STEPS.Clone, ctx.stepOptions(STEPS.UpdatePackage));

    expect(stepList[1].id).toEqual(STEPS.UpdatePackage);

    // Updates 'previous' and 'next' references of previous and next steps
    expect(stepList[0].previous).toBeUndefined();
    expect(stepList[0].next?.id).toEqual(STEPS.UpdatePackage);
    expect(stepList[1].previous?.id).toEqual(STEPS.Clone);
    expect(stepList[1].next?.id).toEqual(STEPS.NpmInstall);
  });
});
