/**
 * Casual Maze Game Test Harness — Suite Runner
 * Lightweight zero-dependency test runner with nested describes, hooks, timing, and colored CLI output.
 */

import { setupMocks } from './mocks.mjs';
import { setTestContext } from './assertions.mjs';

setupMocks();

// ANSI Color Helpers
const isTTY = typeof process !== 'undefined' && process.stdout && process.stdout.isTTY;
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
    this.listeners = [];
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

  addListener(fn) {
    if (typeof fn === 'function') {
      this.listeners.push(fn);
    }
  }

  emit(event) {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {
        // Ignore listener error
      }
    }
  }

  parseArgs() {
    const args = typeof process !== 'undefined' && process.argv ? process.argv.slice(2) : [];
    const options = {
      grep: null,
      suite: null,
      suiteRaw: null,
      fast: false,
      verbose: false,
    };

    for (const arg of args) {
      if (arg.startsWith('--grep=')) {
        options.grep = new RegExp(arg.slice(7), 'i');
      } else if (arg.startsWith('--suite=') || arg.startsWith('--filter=')) {
        const raw = arg.startsWith('--suite=') ? arg.slice(8) : arg.slice(9);
        options.suiteRaw = raw;
        options.suite = new RegExp(raw, 'i');
      } else if (arg === '--fast') {
        options.fast = true;
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
      const fullName = suite.getFullName();
      const lowerName = fullName.toLowerCase();

      // --fast flag skips heavy campaign chapter BFS playthroughs
      if (this.cliOptions.fast && lowerName.includes('campaign chapter')) {
        return;
      }

      if (this.cliOptions.suiteRaw) {
        const filter = this.cliOptions.suiteRaw.toLowerCase();
        let matches = false;
        if (filter === 'unit') {
          matches = !lowerName.includes('journey');
        } else if (filter === 'journey' || filter === 'journeys') {
          matches = lowerName.includes('journey');
        } else if (filter === 'engine') {
          matches = lowerName.includes('engine');
        } else if (filter === 'level' || filter === 'levels') {
          matches = lowerName.includes('level') || lowerName.includes('story');
        } else if (filter === 'entity' || filter === 'entities') {
          matches = lowerName.includes('entit') || lowerName.includes('player');
        } else if (filter === 'editor') {
          matches = lowerName.includes('editor');
        } else if (filter === 'campaign') {
          matches = lowerName.includes('campaign');
        } else if (filter === 'ui') {
          matches = lowerName.includes('ui') || lowerName.includes('menu') || lowerName.includes('audio');
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
        this.emit({ type: 'test:pass', suite: suite.getFullName(), test: testCase.name, durationMs });
        console.log(`${indent}  ${colors.green}✓${colors.reset} ${testCase.name} ${colors.gray}(${durationMs}ms)${colors.reset}`);
      } else {
        this.results.failed++;
        this.emit({ type: 'test:fail', suite: suite.getFullName(), test: testCase.name, error: error.message, durationMs });
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

    this.emit({ type: 'run:end', results: this.results, duration: totalDuration });

    if (typeof process !== 'undefined' && typeof process.exit === 'function') {
      if (this.results.failed > 0) {
        console.log(`\n${colors.bold}${colors.red}❌ ${this.results.failed} TEST(S) FAILED${colors.reset}\n`);
        process.exit(1);
      } else {
        console.log(`\n${colors.bold}${colors.green}✨ ALL ${this.results.passed} TESTS PASSED (0 FAILED)${colors.reset}\n`);
        process.exit(0);
      }
    }

    return this.results;
  }
}

const runner = new TestRunner();

export { runner, TestRunner };
export const describe = runner.describe.bind(runner);
export const it = runner.it.bind(runner);
export const test = runner.test.bind(runner);
export const beforeAll = runner.beforeAll.bind(runner);
export const afterAll = runner.afterAll.bind(runner);
export const beforeEach = runner.beforeEach.bind(runner);
export const afterEach = runner.afterEach.bind(runner);
export const run = runner.run.bind(runner);
