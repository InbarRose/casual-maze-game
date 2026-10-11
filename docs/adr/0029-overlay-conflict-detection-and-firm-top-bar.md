# ADR-0029: UI Overlay Conflict Detection, Visibility Coordinator & Firm Top Navigation Bar

## Status
Accepted

## Date
2026-10-11

## Context
As the game gained rich HUD overlays, floating widgets, and interactive panels (Tactical Radar Minimap, Activity Feed, Virtual Movement Controls, Tutorial Hint Card, and various modals), mobile players on compact screen form factors ($\le 768\text{px}$) experienced visual congestion and component collisions:

1. **Mobile Overlay Occlusion & Collisions**:
   On compact mobile screens ($\le 450\text{px}$), expanding the tactical radar minimap on the right and expanding the activity feed on the left caused the two panels to collide directly and block the maze canvas.
2. **Modal Infiltration & Visual Noise**:
   When opening modal dialogs (Pause Menu, Settings, Player Profile, Guide Handbook, Feedback Reporter, Lore Journal, Activity Log), floating HUD elements underneath remained semi-visible and interactive or visually distracting, competing with modal focus.
3. **Floating Island Fragmentation**:
   The upper HUD previously utilized separated floating island clusters (`hud-island-left`, `hud-island-center`, `hud-island-right`). On mobile devices with variable notches, camera cutouts, and status bars, these disjointed islands floated at different vertical offsets, causing erratic visual shifting and overlapping action buttons.
4. **Lack of Automated Collision Resolution**:
   Players who dragged the virtual D-pad controls or activity feed could position them on top of other essential HUD components without automatic conflict resolution or safe-zone docking.

## Decisions

### 1. Dedicated OverlayManager & Priority Hierarchy
Created `js/ui/overlay-manager.js` with a deterministic priority hierarchy:
- `MODAL (100)`: Settings, Profile, Guide, Feedback, Lore Journal, Activity Log, Restart, Victory.
- `PAUSE_MENU (90)`: Full-screen pause drawer.
- `TOP_BAR (80)`: Firm top navigation & command bar.
- `VIRTUAL_CONTROLS (70)`: D-pad / action controls.
- `MINIMAP (60)`: Tactical radar canvas.
- `ACTIVITY_FEED (50)`: Real-time action log stream.
- `TUTORIAL_HINT (40)`: Objective hint / prologue card.

### 2. Modal Suppression Coordinator
Integrated `overlayManager.setModalActive(modalId, active)` into the central `setViewObscured(obscured, modalId)` coordinator:
- When any modal or pause drawer opens, floating overlays (`category: 'floating'`) automatically receive `.overlay-suppressed` (`opacity: 0; pointer-events: none; visibility: hidden; transition: opacity 0.2s;`).
- When all modals close, floating overlays seamlessly restore without losing their expanded or minimized states.

### 3. Mobile Mutual Exclusion Between Minimap & Activity Feed
Implemented mutual exclusion for compact viewports ($\le 768\text{px}$):
- Expanding the Tactical Radar Minimap (`toggleMinimap(false)`) automatically minimizes the Activity Feed.
- Expanding the Activity Feed (`toggleActivityFeed(false)`) automatically minimizes the Tactical Radar Minimap.
- Both buttons (`#btn-topbar-minimap` and `#btn-hud-feed-pill`) reflect their synchronized active status with `.active` badges.

### 4. Firm Top Navigation Bar
Replaced fragmented floating islands with a solid, anchored `.firm-top-bar`:
- Anchored to the top with `position: fixed; top: 0; left: 0; right: 0; height: var(--top-bar-height, 52px);`.
- Features unified visual styling (`background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255, 255, 255, 0.1);`).
- Contains all primary navigation, breadcrumbs, tactical radar toggle (`#btn-topbar-minimap`), activity feed toggle (`#btn-hud-feed-pill`), settings quick-button (`#hud-btn-settings`), profile button (`#hud-btn-profile`), and menu button (`#btn-open-menu`).
- Floating overlays are positioned below the firm bar (`top: calc(var(--top-bar-height, 52px) + 8px);`), preventing any top bar overlap.

### 5. Spatial Collision Detection & Relocation
- Implemented `checkSpatialIntersection(elA, elB)` using bounding client rectangles (AABB collision test).
- If virtual controls are dragged into collision with another visible overlay, `detectAndResolveConflicts()` automatically docks virtual controls back to safe bounds.
- Triggered on window `resize`, controls drag end, and activity feed drag end.

### 6. Semantic Version Increment
Incremented system semantic version to `v1.22.0` across `package.json`, `js/core/version.js`, `test.html`, and documentation.

## Consequences

### Positive
- Clean, collision-free gameplay on mobile screens of any aspect ratio.
- Modals take full, uncluttered focus without floating HUD noise in the background.
- Firm top bar provides a consistent, professional command deck with immediate access to all game menus and toggles.
- Zero server dependencies; 100% static GitHub Pages compatible.

### Neutral / Trade-offs
- On mobile devices, players cannot view the expanded minimap and expanded activity feed simultaneously; one automatically minimizes when the other opens. Both can be toggled in 1 tap from the firm top bar.
