/**
 * Dependency Graph Register for Casual Maze Game
 * Maps source file patterns to test suites (both primary and transitive).
 */

export const DEPENDENCY_REGISTER = [
  // 1. Core Framework & Shared Infrastructure (Transitive Impact)
  {
    pattern: /^js\/core\/constants\.js$/,
    suites: [
      'tests/unit/core/constants.test.mjs',
      'tests/unit/core/coordinates-xyz.test.mjs',
      'tests/unit/engine/collision.test.mjs',
      'tests/unit/engine/perspective-renderer.test.mjs',
      'tests/unit/engine/biome-surface-shaders.test.mjs',
      'tests/unit/components/cmp-11-asset-pipeline-and-scoring.test.mjs',
      'tests/integration/journeys/multi-elevation.journey.test.mjs'
    ],
    reason: 'Core constants define tile codes, directions, themes, and keybindings'
  },
  {
    pattern: /^js\/core\/storage\.js$/,
    suites: [
      'tests/unit/core/storage.test.mjs',
      'tests/unit/core/storage-migration-and-diagnostics.test.mjs',
      'tests/unit/core/storage-backup-restore.test.mjs',
      'tests/unit/core/storage-metadata-snapshot.test.mjs',
      'tests/unit/components/cmp-14-profile-and-progression.test.mjs',
      'tests/unit/components/cmp-15-settings-system.test.mjs'
    ],
    reason: 'Storage manages game saves, profiles, snapshots, and backups'
  },
  {
    pattern: /^js\/core\/geometry\.js$/,
    suites: [
      'tests/unit/core/geometry.test.mjs',
      'tests/unit/core/coordinates-xyz.test.mjs',
      'tests/unit/engine/collision.test.mjs',
      'tests/unit/engine/camera.test.mjs'
    ],
    reason: 'Geometry value objects (Vec2, GridRect, Heading)'
  },
  {
    pattern: /^js\/core\/events\.js$/,
    suites: [
      'tests/unit/core/events.test.mjs',
      'tests/unit/components/cmp-01-app-shell.test.mjs',
      'tests/unit/components/cmp-05-06-hud-and-action-feedback.test.mjs'
    ],
    reason: 'EventBus event mediation across engine and UI'
  },
  {
    pattern: /^js\/core\/prng\.js$/,
    suites: [
      'tests/unit/core/prng.test.mjs',
      'tests/unit/core/maze-generator.test.mjs',
      'tests/unit/editor/generator-integration.test.mjs'
    ],
    reason: 'Procedural PRNG generator'
  },
  {
    pattern: /^js\/core\/version\.js$/,
    suites: [
      'tests/unit/core/versioning.test.mjs',
      'tests/unit/levels/level-drift.test.mjs'
    ],
    reason: 'Version definitions'
  },
  {
    pattern: /^js\/core\/asset-loader\.js$/,
    suites: [
      'tests/unit/assets/asset-catalog.test.mjs',
      'tests/unit/assets/asset-drift.test.mjs',
      'tests/unit/renderer/vector-rendering.test.mjs',
      'tests/unit/components/cmp-11-asset-pipeline-and-scoring.test.mjs'
    ],
    reason: 'SVG Asset Loader pipeline'
  },

  // 2. Engine Subsystem (Collision, Camera, Renderer, GameLoop)
  {
    pattern: /^js\/engine\/collision\.js$/,
    suites: [
      'tests/unit/engine/collision.test.mjs',
      'tests/unit/engine/multi-elevation-pathfinding.test.mjs',
      'tests/integration/journeys/multi-elevation.journey.test.mjs',
      'tests/integration/campaign/chapter-2.test.mjs'
    ],
    reason: 'Collision Engine physics, multi-elevation ramps, bridges'
  },
  {
    pattern: /^js\/engine\/camera\.js$/,
    suites: [
      'tests/unit/engine/camera.test.mjs',
      'tests/unit/engine/camera-rotation.test.mjs',
      'tests/unit/engine/camera-zoom.test.mjs',
      'tests/integration/journeys/camera-rotation.journey.test.mjs'
    ],
    reason: 'Camera math, viewport culling, 4-way rotation'
  },
  {
    pattern: /^js\/engine\/renderer\.js$|^js\/engine\/biome-surface-shaders\.js$/,
    suites: [
      'tests/unit/engine/perspective-renderer.test.mjs',
      'tests/unit/engine/depth-sorting.test.mjs',
      'tests/unit/renderer/vector-rendering.test.mjs',
      'tests/unit/renderer/particles-lighting.test.mjs',
      'tests/unit/engine/canvas-visual-regression.test.mjs',
      'tests/unit/engine/entrance-exit-visuals.test.mjs',
      'tests/unit/engine/biome-surface-shaders.test.mjs'
    ],
    reason: 'Canvas 2.5D rendering, shaders, surface caustics'
  },
  {
    pattern: /^js\/engine\/fog\.js$/,
    suites: [
      'tests/unit/engine/fog.test.mjs',
      'tests/unit/engine/fog-expansion.test.mjs',
      'tests/integration/journeys/fog-exploration.journey.test.mjs'
    ],
    reason: 'Fog of war raycasting and exploration masks'
  },
  {
    pattern: /^js\/engine\/solver\.js$/,
    suites: [
      'tests/unit/engine/solver.test.mjs',
      'tests/unit/engine/multi-elevation-pathfinding.test.mjs',
      'tests/integration/journeys/campaign-solvability.journey.test.mjs'
    ],
    reason: 'BFS labyrinth reachability and shortest path solver'
  },
  {
    pattern: /^js\/engine\/game-loop\.js$|^js\/engine\/game-state-manager\.js$|^js\/engine\/movement-controller\.js$|^js\/engine\/interaction-dispatcher\.js$/,
    suites: [
      'tests/unit/engine/game-state-manager.test.mjs',
      'tests/unit/engine/click-to-move-and-hotkeys.test.mjs',
      'tests/unit/engine/interact-directions-disambiguation.test.mjs',
      'tests/unit/engine/scoring-medals.test.mjs',
      'tests/unit/components/cmp-05-06-hud-and-action-feedback.test.mjs',
      'tests/integration/journeys/interactive-activities.journey.test.mjs'
    ],
    reason: 'GameLoop orchestration, movement, interaction, and state'
  },
  {
    pattern: /^js\/engine\/input-manager\.js$/,
    suites: [
      'tests/unit/engine/input-manager.test.mjs',
      'tests/unit/engine/click-to-move-and-hotkeys.test.mjs',
      'tests/unit/ui/touch-controls.test.mjs'
    ],
    reason: 'InputManager keyboard, gamepad, and touch controls'
  },
  {
    pattern: /^js\/engine\/minimap\.js$/,
    suites: [
      'tests/unit/engine/tactical-minimap.test.mjs',
      'tests/unit/ui/mobile-movement-and-minimap.test.mjs'
    ],
    reason: 'Tactical minimap radar'
  },
  {
    pattern: /^js\/engine\/replay-player\.js$/,
    suites: [
      'tests/unit/engine/replay-player.test.mjs',
      'tests/unit/ui/replay-theater-and-feed.test.mjs',
      'tests/unit/components/cmp-17-diagnostic-lab-theater.test.mjs'
    ],
    reason: 'Replay player transport'
  },

  // 3. Entity Models (Polymorphic Entities)
  {
    pattern: /^js\/entities\//,
    suites: [
      'tests/unit/entities/base-entity.test.mjs',
      'tests/unit/entities/player.test.mjs',
      'tests/unit/entities/entities.test.mjs',
      'tests/unit/entities/dynamic-activities.test.mjs',
      'tests/unit/entities/signpost.test.mjs',
      'tests/unit/entities/wall-decor.test.mjs',
      'tests/unit/entities/checkpoint.test.mjs',
      'tests/unit/entities/collectible.test.mjs',
      'tests/unit/entities/riddle-item.test.mjs',
      'tests/unit/entities/pedestal.test.mjs',
      'tests/integration/journeys/obstacle-interactions.journey.test.mjs',
      'tests/integration/journeys/riddle-pedestals.journey.test.mjs'
    ],
    reason: 'Interactive entity domain models'
  },

  // 4. Editor Studio
  {
    pattern: /^js\/editor\//,
    suites: [
      'tests/unit/editor/level-validator.test.mjs',
      'tests/unit/editor/json-exporter.test.mjs',
      'tests/unit/editor/editor-canvas.test.mjs',
      'tests/unit/editor/editor-buttons-and-functions.test.mjs',
      'tests/unit/editor/history-stack.test.mjs',
      'tests/unit/editor/prefabs-and-autofix.test.mjs',
      'tests/unit/editor/bridge-ramp-guide.test.mjs',
      'tests/unit/editor/generator-integration.test.mjs',
      'tests/unit/editor/custom-prefabs.test.mjs',
      'tests/unit/editor/diagnostic-pins-validation.test.mjs',
      'tests/unit/editor/entrance-exit-clash.test.mjs',
      'tests/unit/editor/editor-perspective-and-ui.test.mjs',
      'tests/unit/components/cmp-08-10-editor-studio.test.mjs',
      'tests/integration/journeys/editor-authoring.journey.test.mjs'
    ],
    reason: 'Architect Map Editor Studio tools and validator'
  },

  // 5. UI & Audio
  {
    pattern: /^js\/ui\/app-header\.js$|^js\/ui\/mobile-nav-drawer\.js$/,
    suites: [
      'tests/unit/ui/app-header.test.mjs',
      'tests/unit/components/cmp-01-app-shell.test.mjs'
    ],
    reason: 'Application header & mobile nav drawer'
  },
  {
    pattern: /^js\/ui\/settings-modal\.js$/,
    suites: [
      'tests/unit/components/cmp-15-settings-system.test.mjs',
      'tests/unit/ui/github-issues-89-90-91.test.mjs'
    ],
    reason: 'Settings modal dialog'
  },
  {
    pattern: /^js\/ui\/profile-modal\.js$/,
    suites: [
      'tests/unit/ui/profile-customization.test.mjs',
      'tests/unit/ui/avatar-presets.test.mjs',
      'tests/unit/components/cmp-14-profile-and-progression.test.mjs'
    ],
    reason: 'Player profile modal'
  },
  {
    pattern: /^js\/ui\/audio-fx\.js$|^js\/ui\/audio-ambience\.js$/,
    suites: [
      'tests/unit/ui/audio-fx.test.mjs',
      'tests/unit/ui/audio-ambience.test.mjs',
      'tests/unit/ui/elevation-audio.test.mjs'
    ],
    reason: 'Web Audio FX and ambient engine'
  },
  {
    pattern: /^js\/ui\/overlay-manager\.js$/,
    suites: [
      'tests/unit/ui/overlay-manager.test.mjs',
      'tests/unit/ui/mobile-topbar-and-minimal-exit.test.mjs'
    ],
    reason: 'Overlay priority coordinator'
  },
  {
    pattern: /^js\/ui\/drag-scroll\.js$|^js\/ui\/dynamic-menu-controller\.js$/,
    suites: [
      'tests/unit/ui/drag-scroll-and-dynamic-menu.test.mjs',
      'tests/unit/ui/compact-topbar-and-menus.test.mjs'
    ],
    reason: 'Drag scrolling and dynamic menu overflow'
  },
  {
    pattern: /^js\/ui\//,
    suites: [
      'tests/suites/ui.mjs'
    ],
    reason: 'General UI modules fallback'
  },

  // 6. Campaign Levels (Per-Chapter Isolation)
  {
    pattern: /^levels\/chapter_1\//,
    suites: [
      'tests/unit/levels/chapter-1.test.mjs',
      'tests/integration/campaign/chapter-1.test.mjs'
    ],
    reason: 'Chapter 1 Foundation levels'
  },
  {
    pattern: /^levels\/chapter_2\//,
    suites: [
      'tests/unit/levels/chapter-2.test.mjs',
      'tests/integration/campaign/chapter-2.test.mjs'
    ],
    reason: 'Chapter 2 Vertical levels'
  },
  {
    pattern: /^levels\/chapter_3\//,
    suites: [
      'tests/unit/levels/chapter-3.test.mjs',
      'tests/integration/campaign/chapter-3.test.mjs'
    ],
    reason: 'Chapter 3 Clockwork levels'
  },
  {
    pattern: /^levels\/chapter_4\//,
    suites: [
      'tests/unit/levels/chapter-4.test.mjs',
      'tests/integration/campaign/chapter-4.test.mjs'
    ],
    reason: 'Chapter 4 Astral levels'
  },
  {
    pattern: /^levels\/chapter_5\//,
    suites: [
      'tests/unit/levels/chapter-5.test.mjs',
      'tests/integration/campaign/chapter-5.test.mjs'
    ],
    reason: 'Chapter 5 Danger levels'
  },
  {
    pattern: /^levels\/chapter_6\//,
    suites: [
      'tests/unit/levels/chapter-6.test.mjs',
      'tests/integration/campaign/chapter-6.test.mjs'
    ],
    reason: 'Chapter 6 Arcane levels'
  },
  {
    pattern: /^levels\/chapter_7\//,
    suites: [
      'tests/unit/levels/chapter-7.test.mjs',
      'tests/integration/campaign/chapter-7.test.mjs'
    ],
    reason: 'Chapter 7 Trials levels'
  },
  {
    pattern: /^levels\/chapter_8\//,
    suites: [
      'tests/unit/levels/chapter-8.test.mjs',
      'tests/integration/campaign/chapter-8.test.mjs'
    ],
    reason: 'Chapter 8 Monolith levels'
  },
  {
    pattern: /^levels\/chapter_9\//,
    suites: [
      'tests/unit/levels/chapter-9.test.mjs',
      'tests/integration/campaign/chapter-9.test.mjs'
    ],
    reason: 'Chapter 9 Aqueduct levels'
  },
  {
    pattern: /^levels\/chapter_10\//,
    suites: [
      'tests/unit/levels/chapter-10.test.mjs',
      'tests/integration/campaign/chapter-10.test.mjs'
    ],
    reason: 'Chapter 10 Prismatic levels'
  },
  {
    pattern: /^levels\/stories\/story_sunken_vaults_/,
    suites: [
      'tests/unit/stories/story-4-sunken-vaults.test.mjs',
      'tests/unit/stories/storylines.test.mjs'
    ],
    reason: 'Sunken Vaults story levels'
  },
  {
    pattern: /^levels\/stories\//,
    suites: [
      'tests/unit/stories/storylines.test.mjs',
      'tests/unit/levels/story-1-unbypassable.test.mjs',
      'tests/unit/levels/story-2-unbypassable.test.mjs',
      'tests/unit/levels/story-3-unbypassable.test.mjs',
      'tests/integration/journeys/storylines-progression.journey.test.mjs'
    ],
    reason: 'Story Quest levels'
  },
  {
    pattern: /^levels\/tutorials\//,
    suites: [
      'tests/unit/levels/tutorial-levels.test.mjs',
      'tests/integration/journeys/tutorial-progression.journey.test.mjs'
    ],
    reason: 'Tutorial Academy levels'
  },
  {
    pattern: /^levels\/manifest\.json$|^levels\/schema\.json$/,
    suites: [
      'tests/unit/levels/json-integrity.test.mjs',
      'tests/unit/levels/level-drift.test.mjs'
    ],
    reason: 'Level manifest or schema definition'
  },

  // 7. Vector Assets
  {
    pattern: /^assets\//,
    suites: [
      'tests/unit/assets/asset-catalog.test.mjs',
      'tests/unit/assets/asset-drift.test.mjs',
      'tests/unit/renderer/vector-rendering.test.mjs',
      'tests/unit/components/cmp-11-asset-pipeline-and-scoring.test.mjs'
    ],
    reason: 'SVG vector asset catalog or manifest'
  },

  // 8. Test Harness Core (Modifications to test execution engine trigger all suites)
  {
    pattern: /^tests\/harness\/(runner|assertions|mocks|index)\.mjs$/,
    suites: ['ALL'],
    reason: 'Test harness core execution primitives changed'
  }
];
