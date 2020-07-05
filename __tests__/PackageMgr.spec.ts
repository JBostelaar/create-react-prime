import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import * as i from 'types';
import { mocked } from 'ts-jest/utils';
import PackageMgr from 'src/utils/PackageMgr';
import Logger from 'src/utils/Logger';
import CLIMgr from 'src/CLIMgr';
import mockConsole from './utils/mockConsole';

describe('PackageMgr', () => {
  const ctx = new class {
    readonly mockPkg: i.PackageJson = {
      name: 'create-react-prime',
    };

    createMgrCtx() {
      const cliMgrMock = mocked(CLIMgr);
      const loggerMock = new Logger(cliMgrMock.prototype);

      return {
        cliMgr: cliMgrMock,
        logger: loggerMock,
        packageMgr: new PackageMgr(cliMgrMock.prototype, loggerMock),
      };
    }
  };

  describe('package', () => {
    const restoreConsole = mockConsole();

    afterAll(() => {
      restoreConsole();
    });

    it('Returns the project package as an JS object and the path to the package file', () => {
      const { packageMgr, cliMgr } = ctx.createMgrCtx();
      const mockPkg = ctx.mockPkg;
      const mockPath = path.resolve(mockPkg.name, 'package.json');

      jest.spyOn(cliMgr.prototype, 'projectName', 'get').mockReturnValue('create-react-prime');
      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockPkg));

      const pkg = packageMgr.package;

      expect(pkg.json).toMatchObject(mockPkg);
      expect(pkg.path).toEqual(mockPath);
    });

    it('Errors and exits when no package is found', () => {
      const { packageMgr, logger } = ctx.createMgrCtx();

      jest.spyOn(logger, 'error');
      jest.spyOn(process, 'exit').mockImplementation();
      jest.spyOn(fs, 'readFileSync').mockReturnValue('');
      // Mock parse to prevent error, which is normally prevented by exiting
      jest.spyOn(JSON, 'parse').mockImplementation();

      // Execute getter
      packageMgr.package;

      expect(logger.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    const { packageMgr, cliMgr } = ctx.createMgrCtx();
    const mockPkg = ctx.mockPkg;
    const projectName = 'create-react-prime';

    jest.spyOn(cliMgr.prototype, 'projectName', 'get').mockReturnValue(projectName);
    jest.spyOn(packageMgr, 'write').mockImplementation();

    packageMgr.update(mockPkg);

    expect(mockPkg.version).toEqual('0.0.1');
    expect(mockPkg.name).toEqual(projectName);
    expect(mockPkg.description).toEqual(`Repository of ${projectName}.`);
    expect(mockPkg.author).toEqual('Label A [labela.nl]');
    expect(mockPkg.keywords).toHaveLength(0);
    expect(mockPkg.repository).toMatchObject({
      url: '',
    });
  });
});
