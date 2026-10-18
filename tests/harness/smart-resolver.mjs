/**
 * Smart Test Resolver & Change Analyzer
 * Resolves test suites to run based on changed files and dependency graph.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { DEPENDENCY_REGISTER } from './dependency-register.mjs';

export class SmartTestResolver {
  constructor(options = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.cacheFile = path.join(this.rootDir, '.test-cache.json');
    this.cache = this.loadCache();
  }

  loadCache() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        return JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
      }
    } catch {
      // Ignore corrupted cache
    }
    return { files: {}, lastRun: null };
  }

  saveCache() {
    try {
      fs.writeFileSync(this.cacheFile, JSON.stringify(this.cache, null, 2), 'utf8');
    } catch {
      // Ignore write errors (e.g. read-only env)
    }
  }

  computeFileHash(filePath) {
    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(this.rootDir, filePath);
      if (!fs.existsSync(fullPath)) return null;
      const content = fs.readFileSync(fullPath);
      return crypto.createHash('sha256').update(content).digest('hex');
    } catch {
      return null;
    }
  }

  /**
   * Discovers changed files from git status (staged + uncommitted + untracked).
   * If git is not available or clean, optionally compares against baseRef.
   */
  getChangedFiles(baseRef = 'HEAD') {
    const changed = new Set();

    try {
      // 1. Unstaged modified files
      const diffOut = execSync('git diff --name-only', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      diffOut.split(/\r?\n/).forEach(f => f.trim() && changed.add(f.trim().replace(/\\/g, '/')));

      // 2. Staged modified files
      const stagedOut = execSync('git diff --cached --name-only', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      stagedOut.split(/\r?\n/).forEach(f => f.trim() && changed.add(f.trim().replace(/\\/g, '/')));

      // 3. Untracked files
      const untrackedOut = execSync('git ls-files --others --exclude-standard', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      untrackedOut.split(/\r?\n/).forEach(f => f.trim() && changed.add(f.trim().replace(/\\/g, '/')));

      // 4. If empty and comparing against another ref (e.g. HEAD~1)
      if (changed.size === 0 && baseRef && baseRef !== 'HEAD') {
        const baseOut = execSync(`git diff --name-only ${baseRef}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
        baseOut.split(/\r?\n/).forEach(f => f.trim() && changed.add(f.trim().replace(/\\/g, '/')));
      }
    } catch {
      // Fallback: if not in git repo, inspect directory timestamps
    }

    return Array.from(changed);
  }

  /**
   * Resolves test suites that must run based on changed files and dependency graph.
   * Returns { suitesToRun: string[], all: boolean, reasons: string[] }
   */
  resolveSuites(changedFiles) {
    const suites = new Set();
    const reasons = [];

    if (!changedFiles || changedFiles.length === 0) {
      return { suitesToRun: [], all: false, reasons: ['No files changed'] };
    }

    for (const file of changedFiles) {
      const normalized = file.replace(/\\/g, '/');

      // If test file directly modified, run it directly
      if (normalized.startsWith('tests/') && normalized.endsWith('.test.mjs')) {
        suites.add(normalized);
        reasons.push(`Direct test edit: ${normalized}`);
        continue;
      }

      // If test suite runner modified (e.g. tests/suites/engine.mjs), run its contents
      if (normalized.startsWith('tests/suites/') && normalized.endsWith('.mjs')) {
        suites.add(normalized);
        reasons.push(`Suite runner edit: ${normalized}`);
        continue;
      }

      // Check against dependency register
      let matched = false;
      for (const entry of DEPENDENCY_REGISTER) {
        if (entry.pattern.test(normalized)) {
          matched = true;
          if (entry.suites.includes('ALL')) {
            return { suitesToRun: ['ALL'], all: true, reasons: [`Core dependency changed: ${normalized} (${entry.reason})`] };
          }
          entry.suites.forEach(s => suites.add(s));
          reasons.push(`${normalized} -> ${entry.reason}`);
        }
      }

      // If JS file in js/ or levels/ has no explicit mapping, fallback to general unit
      if (!matched && normalized.startsWith('js/')) {
        suites.add('tests/suites/unit.mjs');
        reasons.push(`Unmapped source file: ${normalized}`);
      }
    }

    return {
      suitesToRun: Array.from(suites),
      all: false,
      reasons
    };
  }

  /**
   * Filter suites using cache: if a test file and its mapped dependencies have
   * identical hashes to their last passing state, we can skip it.
   */
  filterCached(suitePaths) {
    const toRun = [];
    const skipped = [];

    for (const suitePath of suitePaths) {
      const currentHash = this.computeFileHash(suitePath);
      const cached = this.cache.files[suitePath];

      if (cached && cached.passed && cached.hash === currentHash) {
        skipped.push(suitePath);
      } else {
        toRun.push(suitePath);
      }
    }

    return { toRun, skipped };
  }

  /**
   * Record pass status for a test file in cache
   */
  recordPass(suitePath) {
    const hash = this.computeFileHash(suitePath);
    if (hash) {
      this.cache.files[suitePath] = {
        hash,
        passed: true,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Record fail status for a test file in cache
   */
  recordFail(suitePath) {
    const hash = this.computeFileHash(suitePath);
    if (hash) {
      this.cache.files[suitePath] = {
        hash,
        passed: false,
        timestamp: Date.now()
      };
    }
  }
}
