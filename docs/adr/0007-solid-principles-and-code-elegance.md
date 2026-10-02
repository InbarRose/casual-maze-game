# 0007. SOLID Coding Principles, Graceful Object-Oriented Design, and Code Elegance Standards

Date: 2026-10-02

## Status
Accepted

## Context
As the Casual Maze Game has grown from a straightforward flat maze renderer into an expansive platform with multi-elevation bridges, camera rotation, procedural generation, rich entities, riddles, story sagas, and an in-browser map editor, codebase complexity has increased. Several monolithic files historically accumulated mixed concerns (e.g. game loop orchestrating input polling, entity simulation, audio effects, and DOM UI synchronization simultaneously).

The project goal is not over-engineered enterprise abstractions or esoteric algorithms, but rather: **simple, elegant, testable, readable, maintainable, explainable, scalable, robust, and SOLID code**.

## Decision

We adopt the following architectural standards across all client-side JavaScript modules:

### 1. The SOLID Principles Applied to 2D Browser Game Architecture

* **S — Single Responsibility Principle (SRP)**:
  * Each class or module has one clearly defined reason to change.
  * Input polling and device abstraction belong to `InputManager`, not `GameLoop`.
  * Procedural generation belongs to `MazeGenerator`, not `EditorUI`.
  * Entities maintain domain state and interaction logic; rendering is decoupled in renderer or vector sprite pipelines.
  * Target file budget: Keep files small and focused (recommended $\le 300$ lines where feasible, breaking large orchestrators into sub-controllers).

* **O — Open/Closed Principle (OCP)**:
  * Modules are open for extension but closed for modification.
  * Polymorphic entity hierarchy with `BaseEntity`: new gameplay entities (e.g., relics, pedestals, levers, gates) inherit common geometry (`Vec2`), interaction protocols (`canInteract`, `onInteract`), collision flags (`isBlocking`), and prompts (`getPrompt()`) without modifying core collision loops.

* **L — Liskov Substitution Principle (LSP)**:
  * Derived entity subclasses (such as `Key`, `Door`, `Lever`) can substitute `BaseEntity` seamlessly in collision engines, spatial hashing queries, and serialization passes.
  * Spatial query methods accept either primitive coordinates `(x, y)` or immutable value objects `(Vec2)`.

* **I — Interface Segregation Principle (ISP)**:
  * Entities only implement methods relevant to their capabilities.
  * Non-interactive entities are not forced to stub out complex action contracts.
  * UI callback listeners receive minimal, decoupled event payloads rather than internal engine references.

* **D — Dependency Inversion Principle (DIP)**:
  * High-level orchestrators depend on abstractions rather than low-level platform APIs.
  * Sound effects route through the `SoundFX` facade rather than calling `AudioContext` directly across UI components.
  * Storage operations route through `StorageManager` rather than spreading direct `localStorage` accesses across feature files.

### 2. Graceful & Elegant Coding Standards

* **Guard Clauses & Early Returns**:
  * Eliminate deeply nested `if/else` ladders.
  * Validate preconditions, boundaries, and nullability upfront with early `return` or `continue`.

* **Eradication of Magic Values**:
  * Replace magic strings and numbers with typed constants from `js/core/constants.js` (e.g., `ENTITY_TYPES`, `TILES`, `LAYERS`, `CAMERA_HEADINGS`).

* **Value Objects & Immutability**:
  * Utilize lightweight, frozen mathematical structures (`Vec2`, `GridRect`) from `js/core/geometry.js` for coordinate calculations, avoiding incidental mutations across simulation cycles.

* **Graceful Degradation & Zero Backend Dependency**:
  * Maintain 100% static hosting compatibility on GitHub Pages.
  * Safely fallback when web APIs are restricted (e.g. Gamepad API when disconnected, AudioContext before user gesture, localStorage in private browsing).

## Consequences

### Positive
* Modules are modular, readable, self-documenting, and easily navigated.
* Unit testing is straightforward and fast (subsystem unit tests run in headless environments with mock DOM/AudioContext).
* New game entities, tools, and prefabs can be introduced with zero regression risk to existing campaign chapters or map editor tools.
* Reduced cognitive load for developers and AI agents inspecting code.

### Negative / Trade-offs
* Requires disciplined incremental refactoring rather than quick ad-hoc patching.
* Additional files created for specialized responsibilities, managed via standard ES6 module imports.
