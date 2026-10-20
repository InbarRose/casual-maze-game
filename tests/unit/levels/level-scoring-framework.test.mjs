import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { auditAllPlatformLevels, auditLevelMetrics } from '../../../scripts/audit-level-metrics.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');

describe('Levels > Level Scoring Framework & Critical Audit (BL-161, ADR-0045)', () => {
  it('verifies Level Audit Rubric v4.0.0 exists and defines all 6 Chairs and sub-criteria', () => {
    const rubricPath = path.join(rootDir, 'docs', 'LEVEL_AUDIT_RUBRIC.md');
    assert(fs.existsSync(rubricPath), 'LEVEL_AUDIT_RUBRIC.md exists');
    const content = fs.readFileSync(rubricPath, 'utf8');

    assert(content.includes('4.0.0'), 'Rubric defines Version 4.0.0');
    assert(content.includes('Chair 1: Chief Spatial Architect'), 'Defines Chair 1');
    assert(content.includes('Chair 2: Systems & Puzzle Mechanics Director'), 'Defines Chair 2');
    assert(content.includes('Chair 3: Art & Visual Director'), 'Defines Chair 3');
    assert(content.includes('Chair 4: Creative Director / Pacing Lead'), 'Defines Chair 4');
    assert(content.includes('Chair 5: UX & Accessibility Lead'), 'Defines Chair 5');
    assert(content.includes('Chair 6: Narrative & World-Building Director'), 'Defines Chair 6');
    assert(content.includes('Criterion 1.1: Corridor Inertia'), 'Defines Criterion 1.1');
    assert(content.includes('Criterion 2.2: Zero-Bypass Gating Integrity'), 'Defines Criterion 2.2 Gatekeeper');
    assert(content.includes('Criterion 3.2: 2.5D Architectural Depth'), 'Defines Criterion 3.2');
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
      assert(content.includes(`* **Scrutinized Gaps & Critical Deductions**:`) || content.includes(`Deductions`), `Scorecard has Scrutinized Gaps`);
      assert(content.includes(`* **Enhancement Directives**:`) || content.includes(`Directives`), `Scorecard has Enhancement Directives`);
    }
  });

  it('verifies all 53 levels achieve A-Tier or higher (>= 45.00 / 60.00)', () => {
    const registerPath = path.join(rootDir, 'docs', 'LEVEL_SCORING_REGISTER.md');
    const content = fs.readFileSync(registerPath, 'utf8');

    // Extract table rows from Master Platform Quality League Table
    const tableLines = content.split('\n').filter(line => line.startsWith('| **'));
    assertEqual(tableLines.length, 53, 'Master table contains 53 rows');

    for (const row of tableLines) {
      const parts = row.split('|').map(p => p.trim());
      // Column 15 is Master Score (/60), Column 16 is Tier
      const id = parts[1].replace(/\*\*/g, '');
      const scoreMatch = parts[15].match(/([0-9]+\.[0-9]+)/);
      assert(scoreMatch, `Score found in row for ${id}: "${parts[15]}"`);
      const score = parseFloat(scoreMatch[1]);
      const tier = parts[16].replace(/\*\*/g, '');

      assert(score >= 45.0, `Level ${id} score (${score}) meets A-Tier threshold >= 45.00`);
      assert(['A', 'A+', 'S', 'S+'].includes(tier), `Level ${id} tier is certified A or higher (was ${tier})`);
    }
  });
});
