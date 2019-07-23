/* eslint-disable no-console */
const path = require('path');
const { exec } = require('child_process');

const NODE_SCRIPT = `node ${path.resolve('src/index.js')}`;
const TEST_DIRECTORY = 'crp-test';

const tests = [
  // Boilerplates
  {
    name: 'client',
    script: `${NODE_SCRIPT} ${TEST_DIRECTORY}-0`,
  },
  {
    name: 'ssr',
    script: `${NODE_SCRIPT} -t ssr ${TEST_DIRECTORY}-1`,
  },
  {
    name: 'native',
    script: `${NODE_SCRIPT} -t native ${TEST_DIRECTORY}-2`,
  },

  // Typescript
  {
    name: 'client + typescript',
    script: `${NODE_SCRIPT} --typescript ${TEST_DIRECTORY}-3`,
  },
];


const removeDirectory = (i, cb) => {
  exec(`rm -rf ${path.resolve(TEST_DIRECTORY)}-${i}`, cb);
};


const installation = async () => new Promise((res, rej) => {
  const runTest = (i) => {
    const test = tests[i];

    console.log(`🛠  Running test '${test.name}'`);

    // Run test script
    exec(test.script, (err) => {
      if (err) {
        console.error(`❌  Test '${test.name}' failed`);
        finishTest(false);

        return;
      }

      // Finish up test
      removeDirectory(i, (err) => {
        if (err) return console.error(`❌  Removing directory for test '${test.name}' failed`);

        console.log(`✅  Test '${test.name}' passed!`);
        finishTest(true);
      });
    });
  };


  let testsChecked = 0;
  let testsSucceeded = 0;

  const finishTest = (success) => {
    testsChecked++;

    if (success) {
      testsSucceeded++;
    }

    if (testsChecked >= tests.length) {
      console.log('------');

      // Check if all tests are done.
      if (testsSucceeded >= tests.length) {
        console.log('✅  All tests passed!');

        res(true);
      } else {
        console.error('❌  Test failed.');

        res(false);
      }
    }
  };


  const run = () => {
    // Remove all directories in case there is any left over
    tests.forEach((_, i) => {
      removeDirectory(i);
    });

    // Run all test simultaneously
    tests.forEach((_, i) => {
      runTest(i);
    });
  };

  run();
});


module.exports = installation;
