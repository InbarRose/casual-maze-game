# ADR-0033: Universal Click-and-Drag Menu Scrolling, Vertical Main Menu Scroll & Dynamic Size Detection

## Status
Accepted

## Date
2026-10-12

## Context
Across diverse devices—particularly smaller screens, mobile devices, and constrained desktop browser windows—navigation bars and menus with rich feature sets frequently face layout bottlenecks.
Previous iterations solved menu sprawling by consolidating top bar controls into single-button dropdowns (`BL-121`, `ADR-0031`) and providing mobile virtual control drawers (`BL-122`, `ADR-0032`). However, users on smaller screens still faced usability challenges:
1. **Horizontal Menu Clippings**: On small viewports, horizontal headers (such as `#firm-top-bar`, `.app-nav-header`, `#mode-tabs`, and `.sidebar-category-nav`) could clip or obscure essential buttons unless the user possessed a trackpad or keyboard. Mouse users lacked intuitive click-and-drag sideways navigation.
2. **Vertical Main Menu Stacking**: In landscape mode on mobile phones or short desktop windows, tall dialogs (e.g. Pause Menu with its 4 functional sections, Modal dialogs, Category drawers) required smooth, intuitive vertical scrollability and mouse drag-to-scroll support so options never get cut off.
3. **Dynamic Size Detection & Pagination**: Static media queries alone do not account for fluid resizing or localized container overflows. The system needed responsive size detection to dynamically evaluate container constraints, collapse overflowing elements, provide clear scroll cues, and supply pagination controls (`‹ Page X/Y ›`) or step navigation to expand options effortlessly.

## Decision
1. **Universal Mouse & Touch Drag-to-Scroll (`DragScroller`)**:
   - Implemented `DragScroller` (`js/ui/drag-scroll.js`) adhering to the Single Responsibility Principle.
   - Provides smooth click-and-drag horizontal (`axis: 'x'`), vertical (`axis: 'y'`), or bidirectional (`axis: 'both'`) scrolling.
   - Differentiates stationary button clicks from drag gestures using a 5px threshold (`dragThreshold`), ensuring that clicks on buttons/links work seamlessly while drag gestures smoothly pan the container without triggering unintended button activations.
   - Features grab/grabbing cursor states (`.drag-scroll-x`, `.is-dragging`) and light inertial kinetic momentum.
   - Implemented `autoInitDragScroll(root)` to automatically attach drag-scrolling to any DOM element decorated with `[data-drag-scroll]`.

2. **Responsive Dynamic Size Detection (`DynamicMenuController`)**:
   - Implemented `DynamicMenuController` (`js/ui/dynamic-menu-controller.js`) leveraging `ResizeObserver` (with window resize fallback).
   - Monitors available client dimensions against scroll geometry in real-time.
   - Automatically maintains visual overflow and scroll availability classes: `.is-overflowing-x`, `.can-scroll-left`, `.can-scroll-right`, `.is-overflowing-y`, `.can-scroll-up`, `.can-scroll-down`.
   - Offers optional auto-generated pagination controls (`.dynamic-menu-pager`, `‹`, `1/X`, `›`) allowing players to click through menu pages with one touch.

3. **Global HUD & Menu Integration**:
   - **Game Player HUD (`maze.html`)**: `#firm-top-bar` integrates `DynamicMenuController`, allowing horizontal click-and-drag scrolling across navigation, inventory, and action clusters on compact viewports with edge fade cues.
   - **In-Game Pause Menu (`maze.html`)**: `#game-pause-modal .modal-body` and `.mobile-more-actions` integrate vertical drag-to-scroll, guaranteeing all 4 pause sections remain reachable on short/landscape mobile displays.
   - **Universal App Header (`app-header.js`)**: `.app-nav-links` and `.app-nav-inner` support drag-to-scroll and pagination across all game pages.
   - **Hub Mode Selector (`index.html`)**: `#mode-tabs` integrates `DynamicMenuController` with smooth drag scrolling and pagination.
   - **Architect Studio & Replay Lab (`editor.html`, `test.html`)**: Category navigation and test lab tabs support drag-to-scroll via `data-drag-scroll="x"`.

4. **Zero Server Dependency & Static Architecture**:
   - 100% static, client-side Vanilla HTML5, CSS3, and ES6 browser modules. Zero external libraries.

## Consequences

### Positive
- Players on small mobile screens and narrow browser windows can effortlessly pan top bars and main menus with mouse or touch.
- Stationary button clicks and interactions remain 100% responsive and are never swallowed by drag gestures.
- Dynamic size detection guarantees that whenever content overflows, visual edge cues and page controls emerge automatically.
- Reusable modular architecture allows any future menu or drawer to gain drag-to-scroll and dynamic pagination with a single attribute or line of code.

### Negative
- Containers with drag-scroll active must ensure proper child `flex-shrink: 0` constraints to prevent item compression when scroll space is tight.
