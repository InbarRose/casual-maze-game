import fs from 'fs';
import path from 'path';

function auditLevel(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const ground = data.layers ? data.layers.ground : data.ground;
  const overhead = data.layers ? data.layers.overhead : (data.overhead || []);
  const h = ground.length;
  const w = ground[0].length;
  
  // Find solid wall block >= 4x4
  let deadSpaces = [];
  for (let y = 1; y < h - 4; y++) {
    for (let x = 1; x < w - 4; x++) {
      let isAllWall = true;
      for (let dy = 0; dy < 4; dy++) {
        for (let dx = 0; dx < 4; dx++) {
          if (ground[y + dy][x + dx] !== 1) {
            isAllWall = false;
            break;
          }
        }
        if (!isAllWall) break;
      }
      if (isAllWall) {
        deadSpaces.push({ x, y });
      }
    }
  }

  // Count bridges, ramps, overhead
  let bridgeCount = 0;
  let rampCount = 0;
  let platformCount = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const g = ground[y][x];
      const o = overhead[y] ? overhead[y][x] : 0;
      if (g === 'B_EW' || g === 'B_NS' || o === 'B_EW' || o === 'B_NS' || g === 'BRIDGE_EW' || g === 'BRIDGE_NS' || o === 'BRIDGE_EW' || o === 'BRIDGE_NS') bridgeCount++;
      if (typeof g === 'string' && g.startsWith('R_')) rampCount++;
      if (typeof o === 'string' && o.startsWith('R_')) rampCount++;
      if (g === 'PLATFORM' || g === 'WALL_WALK' || o === 'PLATFORM' || o === 'WALL_WALK' || g === 'WW' || o === 'WW' || g === 'PL' || o === 'PL') platformCount++;
    }
  }

  const entities = data.entities || [];
  const patrollers = entities.filter(e => e.type === 'patroller' || e.type === 'sentinel').length;
  const hazards = entities.filter(e => e.type === 'timed_hazard' || e.type === 'hazard' || e.type === 'spike_trap' || e.type === 'flame_vent').length;
  const levers = entities.filter(e => e.type === 'lever' || e.type === 'switch').length;
  const portals = entities.filter(e => e.type === 'portal' || e.type === 'teleporter').length;
  const keys = entities.filter(e => e.type === 'key').length;
  const doors = entities.filter(e => e.type === 'door').length;
  const secrets = entities.filter(e => e.type === 'secret_wall' || e.type === 'gem').length;

  return {
    id: data.id,
    title: data.title,
    dim: `${w}x${h}`,
    dead4x4Count: deadSpaces.length,
    bridges: bridgeCount,
    ramps: rampCount,
    platforms: platformCount,
    patrollers,
    hazards,
    levers,
    portals,
    keys,
    doors,
    secrets
  };
}

console.log('=== CAMPAIGN LEVELS (CHAPTERS 1 - 10) AUDIT ===\n');
for (let ch = 1; ch <= 10; ch++) {
  const dir = `levels/chapter_${ch}`;
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort((a,b) => {
    const na = parseInt(a.replace(/level_|\.json/g, ''));
    const nb = parseInt(b.replace(/level_|\.json/g, ''));
    return na - nb;
  });
  console.log(`--- CHAPTER ${ch} ---`);
  for (const f of files) {
    const res = auditLevel(path.join(dir, f));
    console.log(`Lvl ${res.id.padStart(2)}: ${res.title.padEnd(24)} ${res.dim.padEnd(5)} | Dead4x4: ${res.dead4x4Count.toString().padStart(2)} | B/R/P: ${res.bridges}/${res.ramps}/${res.platforms} | Keys/Doors: ${res.keys}/${res.doors} | Patrollers: ${res.patrollers} | Hazards: ${res.hazards} | Levers: ${res.levers} | Portals: ${res.portals} | Secrets: ${res.secrets}`);
  }
}
