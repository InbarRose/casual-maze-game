# ADR-0036: Smart Change-Driven Test Selection, Dependency Register & CI Domain Matrix

## Status
Accepted

## Date
2026-10-17

## Context
With the expansion to 53 levels, 160 vector assets, and 152 test suites containing over 10,290 assertions, running `npm test` locally executes the full suite in ~14 seconds. While fast for a complete integration run, developers and agents making small atomic edits (e.g. tweaking a single entity or UI button) experience avoidable latency waiting for unrelated campaign solvers and rendering suites to execute.

Additionally, on GitHub Actions CI, all 152 tests ran in a single monolithic job, which obscured test failure localization across different domains (Core vs Levels vs E2E vs UI).

We need an intelligent, non-naive testing mechanism that:
1. Detects changed files using git diff and working tree changes.
2. Traces transitive dependencies across modules using a dependency graph register.
3. Automatically executes only the necessary test suites locally.
4. Caches passing results by file hash so unchanged tests are skipped without re-execution.
5. Preserves `npm test` as the comprehensive full-run gate.
6. Splits CI into domain-specific parallel matrix jobs for fast, transparent reporting.

## Decision

1. **Dependency Register & Smart Test Resolver (`tests/harness/smart-resolver.mjs`)**:
   - Build a dependency mapping linking source files (`js/**`, `levels/**`, `assets/**`, `css/**`) to their primary and transitive test suites.
   - Core changes (`constants.js`, `storage.js`, `geometry.js`) or harness changes cascade to dependent engine and entity suites.
   - Specific entity/level edits only trigger matching unit and integration suites.
2. **Local Smart Test Runner (`tests/run-smart.mjs`)**:
   - Add `npm run test:changed` and `npm run test:smart`.
   - Inspects `git status` / `git diff` against `HEAD` and optionally branch base.
   - Maintains a lightweight `.test-cache.json` recording test file path, dependency hashes, and last pass timestamp.
3. **CI Domain Splitting (`.github/workflows/ci.yml`)**:
   - Split single CI step into parallel / segmented jobs:
     - `Static & Integrity Validation` (`validate:static`, `validate:drift`, `validate:syntax`)
     - `Core & Engine Subsystems` (`test:engine`, `test:entities`)
     - `Level Solvers & Campaign Megalabyrinths` (`test:campaign`, `test:levels`)
     - `UI Components & Journeys` (`test:journeys`, `test:unit`)
     - `Headless Browser E2E Gate` (`test:e2e`)

## Consequences

- **Positive**:
  - Local atomic edits can be tested in $< 500\text{ms}$ rather than 14 seconds.
  - Zero risk of stale passes: cache is invalidated immediately when source dependencies or test files change.
  - CI failures are immediately isolated to their exact domain without digging through 3,000 lines of console output.
  - 100% pure static, zero-dependency Node compatibility preserved.
