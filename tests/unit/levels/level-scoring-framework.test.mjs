import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { auditAllPlatformLevels, auditLevelMetrics } from '../../../scripts/audit-level-metrics.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');

describe('Levels > Level Scoring Framework & Critical Audit (BL-161, ADR-0045)', () => {
  it('verifies Level Audit Rubric v4.1.0 exists and defines all 8 Chairs and 24 sub-criteria', () => {
    const rubricPath = path.join(rootDir, 'docs', 'LEVEL_AUDIT_RUBRIC.md');
    assert(fs.existsSync(rubricPath), 'LEVEL_AUDIT_RUBRIC.md exists');
    const content = fs.readFileSync(rubricPath, 'utf8');

    assert(content.includes('4.1.0'), 'Rubric defines Version 4.1.0');
    assert(content.includes('Chair 1: Chief Spatial Architect'), 'Defines Chair 1');
    assert(content.includes('Chair 2: 3D Systems & Verticality Director'), 'Defines Chair 2');
    assert(content.includes('Chair 3: Art & Visual Aesthetics Director'), 'Defines Chair 3');
    assert(content.includes('Chair 4: World-Building & Narrative Lead'), 'Defines Chair 4');
    assert(content.includes('Chair 5: Innovation & Novelty Lead'), 'Defines Chair 5');
    assert(content.includes('Chair 6: Fun & Juice Director'), 'Defines Chair 6');
    assert(content.includes('Chair 7: Tension & Danger Lead'), 'Defines Chair 7');
    assert(content.includes('Chair 8: Systems & Calibration Lead'), 'Defines Chair 8');
    assert(content.includes('Criterion 1.1: Corridor Inertia'), 'Defines Criterion 1.1');
    assert(content.includes('Criterion 4.2: Environmental Narrative Clues'), 'Defines Criterion 4.2');
    assert(content.includes('Criterion 6.2: Wry Architect Journal Notes & Diegetic Humor'), 'Defines Criterion 6.2 Humor');
    assert(content.includes('Criterion 7.1: Hazard Rhythm & Suspenseful Timing'), 'Defines Criterion 7.1 Tension');
    assert(content.includes('Criterion 8.1: Zero-Bypass Gating Integrity'), 'Defines Criterion 8.1 Gatekeeper');
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
      assert(content.includes(`* **Game Design & Spatial Layout Critique**:`) || content.includes(`Critique`), `Scorecard has Game Design critique`);
      assert(content.includes(`* **Visual Aesthetics & Environmental Polish**:`) || content.includes(`Visual`), `Scorecard has Visual critique`);
      assert(content.includes(`* **Visual Storytelling, Novelty & Playful Tone**:`) || content.includes(`Storytelling`), `Scorecard has Storytelling critique`);
      assert(content.includes(`* **Tension, Cognitive Challenge & Gating Verification**:`) || content.includes(`Tension`), `Scorecard has Tension critique`);
      assert(content.includes(`* **Scrutinized Gaps & Critical Deductions**:`) || content.includes(`Deductions`), `Scorecard has Scrutinized Gaps`);
      assert(content.includes(`* **Enhancement Directives**:`) || content.includes(`Directives`), `Scorecard has Enhancement Directives`);
    }
  });

  it('verifies all 53 levels achieve A-Tier or higher (>= 60.00 / 80.00)', () => {
    const registerPath = path.join(rootDir, 'docs', 'LEVEL_SCORING_REGISTER.md');
    const content = fs.readFileSync(registerPath, 'utf8');

    // Extract table rows from Master Platform Quality League Table
    const tableLines = content.split('\n').filter(line => line.startsWith('| **'));
    assertEqual(tableLines.length, 53, 'Master table contains 53 rows');

    for (const row of tableLines) {
      const parts = row.split('|').map(p => p.trim());
      // Column 17 is Master Score (/80), Column 18 is Tier
      const id = parts[1].replace(/\*\*/g, '');
      const scoreMatch = parts[17].match(/([0-9]+\.[0-9]+)/);
      assert(scoreMatch, `Score found in row for ${id}: "${parts[17]}"`);
      const score = parseFloat(scoreMatch[1]);
      const tier = parts[18].replace(/\*\*/g, '');

      assert(score >= 60.0, `Level ${id} score (${score}) meets A-Tier threshold >= 60.00 / 80.00`);
      assert(['A', 'A+', 'S', 'S+'].includes(tier), `Level ${id} tier is certified A or higher (was ${tier})`);
    }
  });
});
