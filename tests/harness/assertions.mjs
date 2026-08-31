/**
 * Casual Maze Game Test Harness — Assertion Library
 * Zero-dependency, rich assertion functions for Node.js ES modules.
 */

let currentTestContext = null;

export function setTestContext(ctx) {
  currentTestContext = ctx;
}

function recordAssertion(passed, message, errorDetail = null) {
  if (currentTestContext) {
    currentTestContext.assertionCount = (currentTestContext.assertionCount || 0) + 1;
  }
  if (!passed) {
    const err = new Error(message || 'Assertion failed');
    if (errorDetail) {
      err.detail = errorDetail;
    }
    throw err;
  }
}

/**
 * Basic truthy assertion
 */
export function assert(condition, message) {
  recordAssertion(Boolean(condition), message || 'Expected condition to be truthy');
}

/**
 * Strict equality (===)
 */
export function assertEqual(actual, expected, message) {
  const passed = actual === expected;
  const msg = message || `Expected ${JSON.stringify(actual)} to strictly equal ${JSON.stringify(expected)}`;
  recordAssertion(passed, msg, { actual, expected });
}

/**
 * Strict inequality (!==)
 */
export function assertNotEqual(actual, expected, message) {
  const passed = actual !== expected;
  const msg = message || `Expected ${JSON.stringify(actual)} NOT to equal ${JSON.stringify(expected)}`;
  recordAssertion(passed, msg, { actual, expected });
}

/**
 * Deep equality for objects, arrays, sets, and primitives
 */
export function assertDeepEqual(actual, expected, message) {
  const passed = deepEqual(actual, expected);
  const msg = message || `Deep equality mismatch:\n  Actual:   ${JSON.stringify(actual)}\n  Expected: ${JSON.stringify(expected)}`;
  recordAssertion(passed, msg, { actual, expected });
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (const item of a) {
      if (!b.has(item)) return false;
    }
    return true;
  }

  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [k, v] of a.entries()) {
      if (!b.has(k) || !deepEqual(v, b.get(k))) return false;
    }
    return true;
  }

  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const k of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
    if (!deepEqual(a[k], b[k])) return false;
  }

  return true;
}

/**
 * Expect a function to throw an error
 */
export function assertThrows(fn, expectedErrorOrRegex, message) {
  let threw = false;
  let caughtError = null;

  try {
    fn();
  } catch (err) {
    threw = true;
    caughtError = err;
  }

  if (!threw) {
    recordAssertion(false, message || 'Expected function to throw an error, but it returned normally');
    return;
  }

  if (typeof expectedErrorOrRegex === 'string') {
    const passed = caughtError.message.includes(expectedErrorOrRegex);
    recordAssertion(passed, message || `Expected error message to include "${expectedErrorOrRegex}", got: "${caughtError.message}"`);
  } else if (expectedErrorOrRegex instanceof RegExp) {
    const passed = expectedErrorOrRegex.test(caughtError.message);
    recordAssertion(passed, message || `Expected error message to match ${expectedErrorOrRegex}, got: "${caughtError.message}"`);
  } else {
    recordAssertion(true, message || 'Function threw expected error');
  }
}

/**
 * Collection or string contains item
 */
export function assertIncludes(haystack, needle, message) {
  let passed = false;
  if (typeof haystack === 'string') {
    passed = haystack.includes(needle);
  } else if (Array.isArray(haystack)) {
    passed = haystack.some(item => deepEqual(item, needle));
  } else if (haystack instanceof Set) {
    passed = haystack.has(needle);
  } else if (haystack && typeof haystack === 'object') {
    passed = needle in haystack;
  }

  const msg = message || `Expected collection to include ${JSON.stringify(needle)}`;
  recordAssertion(passed, msg, { haystack, needle });
}

/**
 * Value within numeric range [min, max] (inclusive)
 */
export function assertInRange(value, min, max, message) {
  const passed = typeof value === 'number' && value >= min && value <= max;
  const msg = message || `Expected value ${value} to be within range [${min}, ${max}]`;
  recordAssertion(passed, msg, { value, min, max });
}

/**
 * String matches regex pattern
 */
export function assertMatches(value, regex, message) {
  const passed = typeof value === 'string' && regex.test(value);
  const msg = message || `Expected "${value}" to match regex pattern ${regex}`;
  recordAssertion(passed, msg, { value, regex });
}
