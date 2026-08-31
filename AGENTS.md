# Agent Operating Guidelines — Casual Maze Game

This document outlines the standard operating procedures, architectural principles, development practices, and project management workflows for all AI agents working on the **Casual Maze Game** codebase.

---

## 1. Core Operating Principles

### A. Pure Static Compatibility (GitHub Pages)
* **Zero Backend**: The game must run 100% statically in modern web browsers (hosted on GitHub Pages via custom domain `casual-maze-game.inbarrose.com` in `CNAME`).
* **Technology Stack**: Pure Vanilla HTML5, CSS3, Modern JavaScript (ES6+ native browser modules via `import`/`export`), and HTML5 Canvas 2D.
* **No Runtime Dependencies**: Never introduce packages that require a server runtime in production. The browser directly loads HTML, CSS, and JS.

### B. Small, Atomic Changes & Auto-Commits
* **Frequent Commits**: Keep edits small, focused, and single-purpose so changes are easily tracked and reviewed.
* **Auto-Commit Standard**: Agents must automatically commit verified, passing work to Git using Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`). Never leave unstaged or uncommitted files upon task completion.
* **No Monolithic Refactors**: Break tasks into incremental steps (e.g. models/constants -> engine logic -> UI/integration -> tests).
* **Documentation Integrity**: Preserve all existing non-conflicting comments and docstrings unless deliberately deprecating them.

### C. Mandatory Testing & Validation
* **Automated Tests**: Every new game mechanic, entity, collision rule, PRNG feature, or schema mutation **must** include automated tests in the modular `tests/` directory architecture.
* **Test Command**: Always run `npm test` before concluding any task and ensure all tests pass (`0 failed`).

### D. Protected Branch Workflow & GitHub MCP Lifecycle
* **Branch-First Development**: Agents must work on dedicated task/feature branches (`feat/<name>`, `fix/<name>`, `docs/<name>`) to protect `main`.
* **Ruleset Protection on `main`**: Direct pushes and force-pushes to `main` are blocked by GitHub repository rulesets. All changes must go through a validated Pull Request.
* **GitHub MCP Server (`ServerName: 'github'`)**:
  1. **Branch**: Create and switch to a descriptive branch (`git checkout -b <type>/<short-desc>`).
  2. **Atomic Commits**: Make small, single-purpose commits.
  3. **Local Validation**: Run `npm test` locally and verify `0 failed`.
  4. **Push**: Push the branch to remote (`git push origin <branch>`).
  5. **Open PR via GitHub MCP**: Call `github:create_pull_request` targeting `main` with summary and test report.
  6. **CI Verification**: Ensure GitHub Actions CI status remains green.

---

## 2. Technical References in `docs/`

Detailed architectural specifications and schemas are maintained in `docs/`:

* **[Testing Plan & Quality Assurance](docs/TESTING_PLAN.md)**: Zero-dependency test harness, subsystem coverage matrices, user journeys, future activity templates, and CI gating.
* **[Subsystem Architecture & File Map](docs/ARCHITECTURE.md)**: Engine loops, camera math, 2D raycasting LoS, multi-elevation bridges (`B_EW`, `B_NS`), directional ramps (`R_*`), and complete directory tree.
* **[Level Schema Reference](docs/LEVEL_SCHEMA.md)**: Canonical JSON level format, entity definitions (`key`, `door`, `lever`), and configuration flags.
* **[Project Management & Backlog](docs/PROJECT_MANAGEMENT.md)**: Active roadmap, completed milestone history, and TODO backlog.
* **[Architectural Decision Records (ADRs)](docs/adr/)**: Architectural records and rationale.

---

## 3. Agent Task Checklist

Before concluding any task or reporting back to the user, ensure:
- [ ] Task was developed on a dedicated branch to protect `main`.
- [ ] Changes are modular, focused, and atomic.
- [ ] Zero server dependencies added (remains 100% static on GitHub Pages).
- [ ] New logic or entity types are covered by tests in `tests/`.
- [ ] `npm test` runs and passes with `0 failed`.
- [ ] Relevant documentation (`docs/PROJECT_MANAGEMENT.md`, `docs/ARCHITECTURE.md`, or `docs/adr/`) is updated.
- [ ] Work is committed with conventional, atomic git commit messages.
- [ ] Branch is pushed and Pull Request is opened via GitHub MCP targeting `main` for review.
