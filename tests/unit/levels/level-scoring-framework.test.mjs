import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { auditAllPlatformLevels } from '../../../scripts/audit-level-metrics.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');

describe('Levels > Ground-Truth Empirical Level Scoring Framework & Rubric v5.0.0 (BL-161, BL-162, ADR-0046)', () => {
  it('verifies Level Audit Rubric v5.0.0 defines 8 Chairs and explicit 1-10 column descriptions', () => {
    const rubricPath = path.join(rootDir, 'docs', 'LEVEL_AUDIT_RUBRIC.md');
    assert(fs.existsSync(rubricPath), 'LEVEL_AUDIT_RUBRIC.md exists');
    const content = fs.readFileSync(rubricPath, 'utf8');

    assert(content.includes('5.0.0'), 'Rubric defines Version 5.0.0');
    assert(content.includes('Score 5 = Minimum Shippable Product (MSP)'), 'Anchors 5 to Minimum Shippable Product');
    assert(content.includes('Score 10 = AAA Best-In-Class Benchmark'), 'Anchors 10 to AAA Best-In-Class');
    assert(content.includes('Chair 1: Spatial Architecture & Labyrinth Topology'), 'Defines Chair 1');
    assert(content.includes('Chair 2: 3D Systems & Traversal Mechanics'), 'Defines Chair 2');
    assert(content.includes('Chair 3: Visual Aesthetics, Shaders & Vector Polish'), 'Defines Chair 3');
    assert(content.includes('Chair 4: Visual Storytelling & Environmental Narrative'), 'Defines Chair 4');
    assert(content.includes('Chair 5: Novelty, Subversion & "Aha!" Discovery'), 'Defines Chair 5');
    assert(content.includes('Chair 6: Fun, Juice, Tactile Delight & Whimsical Humor'), 'Defines Chair 6');
    assert(content.includes('Chair 7: Tension, Suspense & Perilous Hazards'), 'Defines Chair 7');
    assert(content.includes('Chair 8: Cognitive Challenge, Gating & Mathematical Calibration'), 'Defines Chair 8');

    // Verify concrete 1-10 columns exist for core criteria
    assert(content.includes('**1** | **Broken/Hostile**') || content.includes('**1** |'), 'Defines Score 1 column');
    assert(content.includes('**5 (MSP)**') || content.includes('**5**'), 'Defines Score 5 column');
    assert(content.includes('**10 (AAA)**') || content.includes('**10**'), 'Defines Score 10 column');
    assert(content.includes('Criterion 8.2: Entity Economy, Meaningful Choices & Multi-Step Logic'), 'Defines Criterion 8.2');
    assert(content.includes('Linear Fetch Chore (Current Critical Pitfall)'), 'Penalizes single-path linear key fetch chores in Criterion 8.2');
    assert(content.includes('Flat Static Decals (Current Pitfall)'), 'Penalizes flat decal boxes in Criterion 3.3');
  });

  it('runs automated empirical metrics across all 53 platform levels with zero dead space', () => {
    const results = auditAllPlatformLevels();
    assertEqual(results.length, 53, 'Audits exactly 53 platform levels');

    let totalDeadSpace = 0;
    let solvableCount = 0;

    for (const r of results) {
      assert(r.id, `Metric result has id: ${r.id}`);
      assert(r.dimensions, `Level ${r.id} has dimensions: ${r.dimensions}`);
      assertEqual(r.deadSpace4x4Count, 0, `Level ${r.id} has zero 4x4 dead space blocks`);
      totalDeadSpace += r.deadSpace4x4Count;

      if (r.isSolvable) {
        solvableCount++;
      }
    }

    assertEqual(totalDeadSpace, 0, 'Total dead space blocks >= 4x4 across entire game is strictly 0');
    assert(solvableCount >= 50, `At least 50 platform levels are directly solvable via basic solver (actual: ${solvableCount})`);
  });

  it('verifies Master Level Scoring Register contains scrutinized scorecards for all 53 levels', () => {
    const registerPath = path.join(rootDir, 'docs', 'LEVEL_SCORING_REGISTER.md');
    assert(fs.existsSync(registerPath), 'LEVEL_SCORING_REGISTER.md exists');
    const content = fs.readFileSync(registerPath, 'utf8');

    const manifestPath = path.join(rootDir, 'levels', 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    assertEqual(manifest.length, 53, 'Manifest contains 53 levels');

    for (const entry of manifest) {
      const headerPattern = `#### Level ${entry.id}:`;
      assert(content.includes(headerPattern), `LEVEL_SCORING_REGISTER.md contains scorecard header for "${entry.id}"`);
      assert(content.includes(`* **Package**: \`levels/`), `Level ${entry.id} scorecard contains Package path`);
      assert(content.includes(`* **Critical Gameplay & Visual Reality Critique**:`) || content.includes(`Critique`), `Scorecard has Reality critique`);
      assert(content.includes(`* **Actionable Overhaul Directives`), `Scorecard has Overhaul Directives`);
    }
  });

  it('verifies scoring register enforces B-/B graduation across all 53 platform levels upon Phase 7 completion (ADR-0047)', () => {
    const registerPath = path.join(rootDir, 'docs', 'LEVEL_SCORING_REGISTER.md');
    const content = fs.readFileSync(registerPath, 'utf8');

    // Extract table rows from Master Platform Quality League Table
    const tableLines = content.split('\n').filter(line => line.startsWith('| **'));
    assertEqual(tableLines.length, 53, 'Master table contains 53 rows');

    let maxOverhauledScore = 0;
    let minOverhauledScore = 80;

    for (const row of tableLines) {
      const parts = row.split('|').map(p => p.trim());
      // Column 17 is Master Score (/80), Column 18 is Tier
      const id = parts[1].replace(/\*\*/g, '');
      const scoreMatch = parts[17].match(/([0-9]+\.[0-9]+)/);
      assert(scoreMatch, `Score found in row for ${id}: "${parts[17]}"`);
      const score = parseFloat(scoreMatch[1]);
      const tier = parts[18].replace(/\*\*/g, '');

      // All 53 levels have completed their respective overhauls and graduate into B- / B Tier (>= 40.00 / 80.00, >= 50%)
      assert(score >= 40.00, `Overhauled level ${id} graduated score (${score}) is >= 40.00 / 80.00 (>= 50%)`);
      assert(['B-', 'B'].includes(tier), `Overhauled level ${id} has B- or B tier (was ${tier})`);
      if (score > maxOverhauledScore) maxOverhauledScore = score;
      if (score < minOverhauledScore) minOverhauledScore = score;
    }

    assert(minOverhauledScore >= 40.00, `Minimum level score (${minOverhauledScore}) reflects B- tier graduation`);
    assert(maxOverhauledScore <= 60.00, `Maximum level score (${maxOverhauledScore}) reflects commercial indie standard within B tier`);
  });
});
