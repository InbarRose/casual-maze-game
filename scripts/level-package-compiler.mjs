/**
 * Casual Maze Game — Level Package Compiler (ADR-0037, BL-143)
 *
 * Compiles and synchronizes modular per-level directory packages:
 *   levels/chapter_X/level_Y/
 *     ├── manifest.json
 *     ├── layers.json
 *     ├── entities.json
 *     └── README.md
 * into canonical composite level structures and distribution JSONs.
 */

import fs from 'fs';
import path from 'path';

/**
 * Check if a directory is a modular level package
 * @param {string} dirPath
 * @returns {boolean}
 */
export function isLevelPackage(dirPath) {
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) return false;
  const manifestPath = path.join(dirPath, 'manifest.json');
  return fs.existsSync(manifestPath);
}

/**
 * Compile a modular level package directory into a composite level object
 * @param {string} packageDir
 * @returns {object} Canonical Level Object
 */
export function compileLevelPackage(packageDir) {
  const manifestPath = path.join(packageDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Invalid level package (missing manifest.json): ${packageDir}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // 1. Resolve Layers
  const layersPath = path.join(packageDir, 'layers.json');
  let layers = manifest.layers;
  if (fs.existsSync(layersPath)) {
    layers = JSON.parse(fs.readFileSync(layersPath, 'utf8'));
  } else if (!layers) {
    layers = { ground: [], overhead: [] };
  }

  // 2. Resolve Entities
  const entitiesPath = path.join(packageDir, 'entities.json');
  let entities = manifest.entities;
  if (fs.existsSync(entitiesPath)) {
    entities = JSON.parse(fs.readFileSync(entitiesPath, 'utf8'));
  } else if (!entities) {
    entities = [];
  }

  // 3. Resolve Documentation / Lore
  const readmePath = path.join(packageDir, 'README.md');
  let documentation = manifest.architectNote || '';
  if (fs.existsSync(readmePath)) {
    documentation = fs.readFileSync(readmePath, 'utf8');
  }

  // Clean package pointers from the runtime object
  const cleanManifest = { ...manifest };
  delete cleanManifest.package;

  // 4. Resolve Multi-Room hierarchy (ADR-0044)
  let rooms = manifest.rooms;
  const roomsDir = path.join(packageDir, 'rooms');
  if (fs.existsSync(roomsDir) && fs.statSync(roomsDir).isDirectory()) {
    rooms = rooms ? { ...rooms } : {};
    for (const roomName of fs.readdirSync(roomsDir)) {
      const roomSubDir = path.join(roomsDir, roomName);
      if (fs.statSync(roomSubDir).isDirectory()) {
        const roomManifestPath = path.join(roomSubDir, 'manifest.json');
        const roomLayersPath = path.join(roomSubDir, 'layers.json');
        const roomEntitiesPath = path.join(roomSubDir, 'entities.json');
        const roomMeta = fs.existsSync(roomManifestPath) ? JSON.parse(fs.readFileSync(roomManifestPath, 'utf8')) : (rooms[roomName] || {});
        const roomLayers = fs.existsSync(roomLayersPath) ? JSON.parse(fs.readFileSync(roomLayersPath, 'utf8')) : (roomMeta.layers || { ground: [], overhead: [] });
        const roomEntities = fs.existsSync(roomEntitiesPath) ? JSON.parse(fs.readFileSync(roomEntitiesPath, 'utf8')) : (roomMeta.entities || []);
        rooms[roomName] = {
          ...roomMeta,
          layers: roomLayers,
          entities: roomEntities,
        };
      }
    }
  }

  const result = {
    ...cleanManifest,
    architectNote: manifest.architectNote || (documentation ? documentation.split('\n\n')[1] || documentation : undefined),
    layers,
    entities,
    packageSource: path.basename(packageDir),
  };

  if (rooms && Object.keys(rooms).length > 0) {
    result.rooms = rooms;
  }

  return result;
}

/**
 * Split a monolithic level object into a modular level directory package
 * @param {object} levelData
 * @param {string} targetDir
 */
export function exportLevelPackage(levelData, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });

  const { layers, entities, rooms, ...metadata } = levelData;

  // 1. Write layers.json
  const layersPath = path.join(targetDir, 'layers.json');
  fs.writeFileSync(layersPath, JSON.stringify(layers || { ground: [], overhead: [] }, null, 2) + '\n', 'utf8');

  // 2. Write entities.json
  const entitiesPath = path.join(targetDir, 'entities.json');
  fs.writeFileSync(entitiesPath, JSON.stringify(entities || [], null, 2) + '\n', 'utf8');

  // 3. Write README.md
  const readmePath = path.join(targetDir, 'README.md');
  const levelTitle = metadata.title || metadata.chapterTitle || `Level ${metadata.id}`;
  const chapterName = metadata.chapter ? metadata.chapter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : (metadata.chapterTitle || 'Campaign / Saga');
  const width = metadata.dimensions?.width || 0;
  const height = metadata.dimensions?.height || 0;
  const parSteps = metadata.parSteps || 'N/A';
  const parTime = metadata.parTime ? `${metadata.parTime}s` : 'N/A';
  const note = metadata.architectNote || metadata.prologueText || 'Architectural exploration of winding labyrinth corridors and vertical bridge elevations.';

  const readmeContent = `# ${levelTitle}

**Chapter**: ${chapterName}  
**Zone**: ${metadata.zone || metadata.theme || 'Default'}  
**Dimensions**: ${width} × ${height}  
**Par Steps**: ${parSteps} | **Par Time**: ${parTime}  
**Theme**: ${metadata.config?.theme || metadata.theme || 'dungeon'}  

## Narrative Lore & Overview
${note}

## Kishōtenketsu Architectural Structure
- **Ki (Introduction)**: Entry sequence introducing corridor orientation and initial pathway forks.
- **Shō (Development)**: Exploration through winding labyrinth corridors with directional inertia ($\ge 70\%$) and deceptive dead ends.
- **Ten (Twist)**: Key puzzle locks, secret walls (\`SW\`), or elevated bridge crossings (\`WALL_WALK\`, \`PLATFORM\`, \`B_EW\`, \`B_NS\`).
- **Ketsu (Resolution)**: Exit sanctum reached through unbypassable mechanical unlocking.
`;
  fs.writeFileSync(readmePath, readmeContent, 'utf8');

  // 4. Handle Multi-Room hierarchy (ADR-0044)
  if (rooms && typeof rooms === 'object') {
    const roomsDir = path.join(targetDir, 'rooms');
    fs.mkdirSync(roomsDir, { recursive: true });
    for (const [roomName, roomData] of Object.entries(rooms)) {
      const roomSubDir = path.join(roomsDir, roomName);
      fs.mkdirSync(roomSubDir, { recursive: true });
      const { layers: rLayers, entities: rEntities, ...rMeta } = roomData;
      fs.writeFileSync(path.join(roomSubDir, 'manifest.json'), JSON.stringify(rMeta, null, 2) + '\n', 'utf8');
      fs.writeFileSync(path.join(roomSubDir, 'layers.json'), JSON.stringify(rLayers || { ground: [], overhead: [] }, null, 2) + '\n', 'utf8');
      fs.writeFileSync(path.join(roomSubDir, 'entities.json'), JSON.stringify(rEntities || [], null, 2) + '\n', 'utf8');
    }
  }

  // 5. Write manifest.json
  const manifestPath = path.join(targetDir, 'manifest.json');
  const manifest = {
    ...metadata,
    package: {
      layers: './layers.json',
      entities: './entities.json',
      documentation: './README.md',
      ...(rooms ? { rooms: './rooms/' } : {})
    },
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
}
