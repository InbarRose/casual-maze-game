/**
 * Casual Maze Game Test Harness — Suite Runner
 * Lightweight zero-dependency test runner with nested describes, hooks, timing, and colored CLI output.
 */

import { setupMocks } from './mocks.mjs';
import { setTestContext } from './assertions.mjs';

setupMocks();

// ANSI Color Helpers
const isTTY = process.stdout && process.stdout.isTTY;
const colors = {
  reset: isTTY ? '\x1b[0m' : '',
  bold: isTTY ? '\x1b[1m' : '',
  dim: isTTY ? '\x1b[2m' : '',
  green: isTTY ? '\x1b[32m' : '',
  red: isTTY ? '\x1b[31m' : '',
  yellow: isTTY ? '\x1b[33m' : '',
  blue: isTTY ? '\x1b[34m' : '',
  magenta: isTTY ? '\x1b[35m' : '',
  cyan: isTTY ? '\x1b[36m' : '',
  gray: isTTY ? '\x1b[90m' : '',
};

class Suite {
  constructor(name, parent = null) {
    this.name = name;
    this.parent = parent;
    this.tests = [];
    this.suites = [];
    this.beforeAllHooks = [];
    this.afterAllHooks = [];
    this.beforeEachHooks = [];
    this.afterEachHooks = [];
  }

  getFullName() {
    if (this.parent && this.parent.name) {
      return `${this.parent.getFullName()} > ${this.name}`;
    }
    return this.name;
  }
}

class TestRunner {
  constructor() {
    this.rootSuite = new Suite('');
    this.currentSuite = this.rootSuite;
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      totalAssertions: 0,
      failures: [],
      suitesCount: 0,
    };
    this.cliOptions = this.parseArgs();
  }

  parseArgs() {
    const args = process.argv.slice(2);
    const options = {
      grep: null,
      suite: null,
      suiteRaw: null,
      verbose: false,
    };

    for (const arg of args) {
      if (arg.startsWith('--grep=')) {
        options.grep = new RegExp(arg.slice(7), 'i');
      } else if (arg.startsWith('--suite=')) {
        const raw = arg.slice(8);
        options.suiteRaw = raw;
        options.suite = new RegExp(raw, 'i');
      } else if (arg === '-v' || arg === '--verbose') {
        options.verbose = true;
      }
    }

    return options;
  }

  describe(name, fn) {
    const previousSuite = this.currentSuite;
    const newSuite = new Suite(name, previousSuite);
    previousSuite.suites.push(newSuite);
    this.currentSuite = newSuite;

    try {
      fn();
    } catch (err) {
      console.error(`Error declaring suite "${name}":`, err);
    } finally {
      this.currentSuite = previousSuite;
    }
  }

  it(name, fn) {
    this.currentSuite.tests.push({ name, fn });
  }

  test(name, fn) {
    this.it(name, fn);
  }

  beforeAll(fn) {
    this.currentSuite.beforeAllHooks.push(fn);
  }

  afterAll(fn) {
    this.currentSuite.afterAllHooks.push(fn);
  }

  beforeEach(fn) {
    this.currentSuite.beforeEachHooks.push(fn);
  }

  afterEach(fn) {
    this.currentSuite.afterEachHooks.push(fn);
  }

  getAllBeforeEachHooks(suite) {
    const hooks = [];
    let cur = suite;
    while (cur) {
      hooks.unshift(...cur.beforeEachHooks);
      cur = cur.parent;
    }
    return hooks;
  }

  getAllAfterEachHooks(suite) {
    const hooks = [];
    let cur = suite;
    while (cur) {
      hooks.push(...cur.afterEachHooks);
      cur = cur.parent;
    }
    return hooks;
  }

  async runSuite(suite, depth = 0) {
    const indent = '  '.repeat(depth);
    const isRoot = suite === this.rootSuite;

    if (!isRoot) {
      this.results.suitesCount++;
      if (this.cliOptions.suiteRaw) {
        const fullName = suite.getFullName();
        const filter = this.cliOptions.suiteRaw.toLowerCase();
        let matches = false;
        if (filter === 'unit') {
          matches = !fullName.toLowerCase().includes('journey');
        } else if (filter === 'journey' || filter === 'journeys') {
          matches = fullName.toLowerCase().includes('journey');
        } else {
          matches = this.cliOptions.suite.test(fullName);
        }
        if (!matches) return;
      }
      console.log(`\n${indent}${colors.bold}${colors.cyan}[Suite] ${suite.name}${colors.reset}`);
    }

    // Run beforeAll hooks
    for (const hook of suite.beforeAllHooks) {
      await hook();
    }

    // Run tests in current suite
    for (const testCase of suite.tests) {
      const fullTestName = `${suite.getFullName()} > ${testCase.name}`;

      if (this.cliOptions.grep && !this.cliOptions.grep.test(fullTestName)) {
        this.results.skipped++;
        continue;
      }

      const testCtx = { assertionCount: 0 };
      setTestContext(testCtx);

      const beforeEachHooks = this.getAllBeforeEachHooks(suite);
      const afterEachHooks = this.getAllAfterEachHooks(suite);

      const startTime = performance.now();
      let error = null;

      try {
        for (const hook of beforeEachHooks) {
          await hook();
        }
        await testCase.fn();
      } catch (err) {
        error = err;
      } finally {
        for (const hook of afterEachHooks) {
          try {
            await hook();
          } catch (hookErr) {
            if (!error) error = hookErr;
          }
        }
        setTestContext(null);
      }

      const durationMs = (performance.now() - startTime).toFixed(1);
      this.results.totalAssertions += testCtx.assertionCount;

      if (!error) {
        this.results.passed++;
        console.log(`${indent}  ${colors.green}✓${colors.reset} ${testCase.name} ${colors.gray}(${durationMs}ms)${colors.reset}`);
      } else {
        this.results.failed++;
        console.log(`${indent}  ${colors.red}✗ FAIL: ${testCase.name} (${durationMs}ms)${colors.reset}`);
        console.log(`${indent}    ${colors.red}${error.message}${colors.reset}`);
        if (error.stack && this.cliOptions.verbose) {
          const stackSnippet = error.stack
            .split('\n')
            .slice(1, 4)
            .map(line => `${indent}    ${colors.gray}${line.trim()}${colors.reset}`)
            .join('\n');
          console.log(stackSnippet);
        }
        this.results.failures.push({
          suite: suite.getFullName(),
          test: testCase.name,
          error,
        });
      }
    }

    // Run child suites recursively
    for (const childSuite of suite.suites) {
      await this.runSuite(childSuite, depth + (isRoot ? 0 : 1));
    }

    // Run afterAll hooks
    for (const hook of suite.afterAllHooks) {
      await hook();
    }
  }

  async run() {
    console.log(`${colors.bold}${colors.blue}=== CASUAL MAZE GAME TEST RUNNER ===${colors.reset}`);
    const suiteStartTime = performance.now();

    await this.runSuite(this.rootSuite);

    const totalDuration = (performance.now() - suiteStartTime).toFixed(1);

    console.log('\n' + '-'.repeat(40));
    console.log(`${colors.bold}TEST SUMMARY:${colors.reset}`);
    console.log(`  Suites:     ${this.results.suitesCount}`);
    console.log(`  Passed:     ${colors.green}${this.results.passed}${colors.reset}`);
    console.log(`  Failed:     ${this.results.failed > 0 ? colors.red : colors.green}${this.results.failed}${colors.reset}`);
    if (this.results.skipped > 0) {
      console.log(`  Skipped:    ${colors.yellow}${this.results.skipped}${colors.reset}`);
    }
    console.log(`  Assertions: ${this.results.totalAssertions}`);
    console.log(`  Duration:   ${totalDuration}ms`);
    console.log('-'.repeat(40));

    if (this.results.failed > 0) {
      console.log(`\n${colors.bold}${colors.red}❌ ${this.results.failed} TEST(S) FAILED${colors.reset}\n`);
      process.exit(1);
    } else {
      console.log(`\n${colors.bold}${colors.green}✨ ALL ${this.results.passed} TESTS PASSED (0 FAILED)${colors.reset}\n`);
      process.exit(0);
    }
  }
}

const runner = new TestRunner();

export const describe = runner.describe.bind(runner);
export const it = runner.it.bind(runner);
export const test = runner.test.bind(runner);
export const beforeAll = runner.beforeAll.bind(runner);
export const afterAll = runner.afterAll.bind(runner);
export const beforeEach = runner.beforeEach.bind(runner);
export const afterEach = runner.afterEach.bind(runner);
export const run = runner.run.bind(runner);
