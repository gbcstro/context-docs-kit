#!/usr/bin/env node
/**
 * No test framework, no dependencies. These check the two things that would
 * silently break the kit: an installer that writes to the wrong place or eats a
 * user's files, and shared references that have drifted between skill copies.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

import { parseTargets, resolvePlan, TARGET_NAMES, TARGETS } from '../src/targets.mjs';
import { planInstall, applyInstall, planUninstall, applyUninstall, shippedSkills, shippedAgents } from '../src/install.mjs';
import { sync } from '../src/sync-shared.mjs';
import { compactChangelog, compactChangelogFile } from '../src/compact-changelog.mjs';
import {
  ECOSYSTEM_CATEGORIES,
  ECOSYSTEM_ITEMS,
  TEAM_PRESETS,
  resolveEcosystemSelection,
  buildEcosystemInstallCommands,
  buildEcosystemUpdateCommands,
} from '../src/ecosystem.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok   ${name}`);
  } catch (err) {
    failed += 1;
    console.log(`  FAIL ${name}`);
    console.log(`       ${err.message.split('\n').join('\n       ')}`);
  }
}

function tmpHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'cdk-test-'));
}

console.log('\ntargets');

test('parseTargets defaults to claude', () => {
  assert.deepEqual(parseTargets(undefined), ['claude']);
});

test('parseTargets expands all', () => {
  assert.deepEqual(parseTargets('all'), TARGET_NAMES);
});

test('parseTargets rejects an unknown name', () => {
  assert.throws(() => parseTargets('claude,notahost'), /unknown target: notahost/);
});

test('parseTargets dedupes', () => {
  assert.deepEqual(parseTargets('claude,claude'), ['claude']);
});

test('codex and antigravity share one project directory', () => {
  const plan = resolvePlan(['codex', 'antigravity'], { project: true, cwd: '/repo' });
  assert.equal(plan.length, 1, 'expected a single deduped destination');
  assert.deepEqual(plan[0].targets, ['codex', 'antigravity']);
  assert.equal(plan[0].skillsDir, path.join('/repo', '.agents', 'skills'));
});

test('codex and antigravity do NOT share a user directory', () => {
  const plan = resolvePlan(['codex', 'antigravity'], { home: '/home/u' });
  assert.equal(plan.length, 2);
});

test('only claude installs persona agents', () => {
  for (const name of TARGET_NAMES) {
    const [group] = resolvePlan([name], { home: '/home/u' });
    const expected = name === 'claude';
    assert.equal(Boolean(group.agentsDir), expected, `${name} agentsDir`);
  }
});

test('all targets use AGENTS.md as the agent file', () => {
  for (const name of TARGET_NAMES) {
    assert.equal(TARGETS[name].agentFile, 'AGENTS.md', `${name} agentFile`);
  }
});

console.log('\ninstall');

test('install writes every skill to every host root', () => {
  const home = tmpHome();
  const plan = planInstall(TARGET_NAMES, { home });
  applyInstall(plan);

  const skills = shippedSkills();
  assert.ok(skills.length > 0, 'package ships no skills');

  for (const group of plan) {
    for (const skill of skills) {
      const md = path.join(group.skillsDir, skill, 'SKILL.md');
      assert.ok(fs.existsSync(md), `missing ${md}`);
    }
    assert.ok(fs.existsSync(path.join(group.skillsDir, '.context-docs-kit.json')), 'missing manifest');
  }

  fs.rmSync(home, { recursive: true, force: true });
});

test('persona agents land only under the claude root', () => {
  const home = tmpHome();
  applyInstall(planInstall(TARGET_NAMES, { home }));

  for (const file of shippedAgents()) {
    assert.ok(fs.existsSync(path.join(home, '.claude', 'agents', file)), `missing ${file}`);
  }
  assert.ok(!fs.existsSync(path.join(home, '.agents', 'agents')), 'codex should get no agents dir');

  fs.rmSync(home, { recursive: true, force: true });
});

test('a second install is a no-op', () => {
  const home = tmpHome();
  applyInstall(planInstall(TARGET_NAMES, { home }));

  const second = planInstall(TARGET_NAMES, { home });
  const actions = new Set(second.flatMap((g) => g.items.map((i) => i.action)));
  assert.deepEqual([...actions], ['current'], `expected all current, got ${[...actions]}`);

  fs.rmSync(home, { recursive: true, force: true });
});

test('a foreign skill directory blocks instead of being overwritten', () => {
  const home = tmpHome();
  const skill = shippedSkills()[0];
  const dest = path.join(home, '.claude', 'skills', skill);
  fs.mkdirSync(dest, { recursive: true });
  fs.writeFileSync(path.join(dest, 'SKILL.md'), 'hand written, do not clobber\n');

  const plan = planInstall(['claude'], { home });
  const item = plan[0].items.find((i) => i.name === skill);
  assert.equal(item.action, 'blocked');

  applyInstall(plan);
  assert.equal(fs.readFileSync(path.join(dest, 'SKILL.md'), 'utf8'), 'hand written, do not clobber\n');

  fs.rmSync(home, { recursive: true, force: true });
});

test('--force overwrites a foreign directory', () => {
  const home = tmpHome();
  const skill = shippedSkills()[0];
  const dest = path.join(home, '.claude', 'skills', skill);
  fs.mkdirSync(dest, { recursive: true });
  fs.writeFileSync(path.join(dest, 'SKILL.md'), 'hand written\n');

  const plan = planInstall(['claude'], { home, force: true });
  assert.equal(plan[0].items.find((i) => i.name === skill).action, 'update');
  applyInstall(plan);
  assert.notEqual(fs.readFileSync(path.join(dest, 'SKILL.md'), 'utf8'), 'hand written\n');

  fs.rmSync(home, { recursive: true, force: true });
});

test('--link symlinks the skill back to the package', () => {
  const home = tmpHome();
  applyInstall(planInstall(['claude'], { home, link: true }), { link: true });

  const skill = shippedSkills()[0];
  const dest = path.join(home, '.claude', 'skills', skill);
  assert.ok(fs.lstatSync(dest).isSymbolicLink(), 'expected a symlink');
  assert.equal(fs.realpathSync(dest), fs.realpathSync(path.join(ROOT, 'skills', skill)));

  fs.rmSync(home, { recursive: true, force: true });
});

console.log('\nuninstall');

test('uninstall removes exactly what was installed', () => {
  const home = tmpHome();
  applyInstall(planInstall(TARGET_NAMES, { home }));

  const bystander = path.join(home, '.claude', 'skills', 'someone-elses-skill');
  fs.mkdirSync(bystander, { recursive: true });
  fs.writeFileSync(path.join(bystander, 'SKILL.md'), 'not ours\n');

  applyUninstall(planUninstall(TARGET_NAMES, { home }));

  for (const skill of shippedSkills()) {
    assert.ok(!fs.existsSync(path.join(home, '.claude', 'skills', skill)), `${skill} survived`);
    assert.ok(!fs.existsSync(path.join(home, '.agents', 'skills', skill)), `codex ${skill} survived`);
  }
  assert.ok(fs.existsSync(bystander), 'uninstall removed a directory it did not install');
  assert.ok(!fs.existsSync(path.join(home, '.claude', 'skills', '.context-docs-kit.json')), 'manifest survived');

  fs.rmSync(home, { recursive: true, force: true });
});

test('uninstall is idempotent', () => {
  const home = tmpHome();
  applyInstall(planInstall(['claude'], { home }));
  applyUninstall(planUninstall(['claude'], { home }));

  const second = planUninstall(['claude'], { home });
  assert.equal(second.reduce((n, g) => n + g.items.length, 0), 0);

  fs.rmSync(home, { recursive: true, force: true });
});

console.log('\nshared references');

test('every skill carries an identical copy of every shared reference', () => {
  const { drifted, files, skills } = sync({ check: true });
  assert.ok(files.length > 0, 'shared/references is empty');
  assert.ok(skills.length > 0, 'no skills found');
  assert.deepEqual(drifted, [], `drifted: ${drifted.join(', ')} - run: npm run sync`);
});

test('every skill has valid frontmatter with name and description', () => {
  for (const skill of shippedSkills()) {
    const raw = fs.readFileSync(path.join(ROOT, 'skills', skill, 'SKILL.md'), 'utf8');
    const body = raw.replace(/\r\n/g, '\n');
    assert.ok(body.startsWith('---\n'), `${skill}: no frontmatter`);
    const fm = body.slice(4, body.indexOf('\n---', 4));
    assert.match(fm, /^name:\s*\S+/m, `${skill}: no name`);
    assert.match(fm, /^description:\s*\S+/m, `${skill}: no description`);
    const declared = fm.match(/^name:\s*(\S+)/m)[1];
    assert.equal(declared, skill, `${skill}: frontmatter name is "${declared}"`);
  }
});

test('the claude @-import appears only behind a host capability check', () => {
  const offenders = [];
  for (const skill of shippedSkills()) {
    const dir = path.join(ROOT, 'skills', skill);
    const walk = (d) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.name.endsWith('.md')) {
          const body = fs.readFileSync(p, 'utf8');
          if (!body.includes('@context/RULES.md')) continue;
          // Every file mentioning the import must also say when it does not apply.
          if (!/supportsImport|import support|hosts\.md|no `@file` import|without import/i.test(body)) {
            offenders.push(path.relative(ROOT, p));
          }
        }
      }
    };
    walk(dir);
  }
  assert.deepEqual(offenders, [], `unguarded @context/RULES.md in: ${offenders.join(', ')}`);
});

test('no skeleton or agent template emits an Open Questions section', () => {
  // The rule is only real if the templates obey it: a skeleton with
  // "## N. Open Questions" in it puts the hole straight back into every doc.
  const offenders = [];
  const scan = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) scan(p);
      else if (e.name.endsWith('.md')) {
        for (const [i, line] of fs.readFileSync(p, 'utf8').split('\n').entries()) {
          // A heading emitted into a generated doc, not prose about the rule.
          if (/^#{1,3} (\d+\. )?Open Questions\s*$/.test(line)) {
            offenders.push(`${path.relative(ROOT, p)}:${i + 1}`);
          }
        }
      }
    }
  };
  scan(path.join(ROOT, 'skills'));
  scan(path.join(ROOT, 'agents'));
  scan(path.join(ROOT, 'shared'));
  assert.deepEqual(offenders, [], `Open Questions heading in: ${offenders.join(', ')}`);
});

test('every skill ships the closing-questions reference', () => {
  for (const skill of shippedSkills()) {
    const ref = path.join(ROOT, 'skills', skill, 'references', 'closing-questions.md');
    assert.ok(fs.existsSync(ref), `${skill} is missing closing-questions.md`);
    const body = fs.readFileSync(path.join(ROOT, 'skills', skill, 'SKILL.md'), 'utf8');
    assert.match(body, /closing-questions\.md/, `${skill}/SKILL.md never points at it`);
  }
});

console.log('\nchangelog discipline & compaction');

test('compactChangelog keeps recent entries and compacts entries older than 30 days', () => {
  const sample = `# Sample — v1 Change Log

## 2026-01-15 — Task: Setup Auth
**Completed:** Implemented JWT login and password hashing.
**Why:** User authentication requirement.
**Affects:** src/auth.ts, test/auth.test.ts.

## 2026-03-25 — Task: Checkout UI
**Completed:** Added billing checkout page.
**Why:** Monetization.
**Affects:** src/checkout.tsx.
`;

  const now = new Date('2026-04-01T00:00:00Z');
  const result = compactChangelog(sample, { days: 30, now });

  assert.equal(result.compactedCount, 1, 'expected 1 entry compacted');
  assert.equal(result.activeCount, 1, 'expected 1 entry active');
  assert.match(result.content, /## Active Log \(Last 30 Days\)/);
  assert.match(result.content, /## 2026-03-25 — Task: Checkout UI/);
  assert.match(result.content, /## Compacted History \(> 30 days\)/);
  assert.match(result.content, /### 2026-01 \(Compacted\)/);
  assert.match(result.content, /- \*\*2026-01-15 \(Task: Setup Auth\):\*\* Implemented JWT login and password hashing/);
});

test('compactChangelog handles multiple runs and merges months gracefully', () => {
  const sample = `# Sample — v1 Change Log

## 2026-01-10 — Task: Database setup
**Completed:** Setup Postgres migrations.
**Why:** Persistent storage.
**Affects:** src/db/schema.ts.

## 2026-01-20 — Task: User model
**Completed:** Added user table.
**Why:** User storage.
**Affects:** src/db/user.ts.
`;

  const now = new Date('2026-04-01T00:00:00Z');
  const res1 = compactChangelog(sample, { days: 30, now });
  assert.equal(res1.compactedCount, 2);

  // Run compaction again on the already-compacted content
  const res2 = compactChangelog(res1.content, { days: 30, now });
  assert.equal(res2.compactedCount, 0, 'subsequent run should compact 0 new entries');
  assert.equal(res2.activeCount, 0);

  // Check that the two January entries are grouped under a single 2026-01 header
  const monthMatches = res2.content.match(/### 2026-01 \(Compacted\)/g);
  assert.equal(monthMatches.length, 1, 'expected single month heading');
  assert.match(res2.content, /Database setup/);
  assert.match(res2.content, /User model/);
});

test('compactChangelog respects custom day thresholds', () => {
  const sample = `# Sample — v1 Change Log

## 2026-03-20 — Task: Feature A
**Completed:** Built feature A.
**Why:** Needed.
**Affects:** src/a.ts.
`;
  const now = new Date('2026-04-01T00:00:00Z'); // 12 days later
  const res30 = compactChangelog(sample, { days: 30, now });
  assert.equal(res30.compactedCount, 0, '12 days old should not compact with days=30');

  const res10 = compactChangelog(sample, { days: 10, now });
  assert.equal(res10.compactedCount, 1, '12 days old should compact with days=10');
});

test('RULES.md references and engineering-standards agent enforce Rule 11 and changelog discipline', () => {
  const rulesPath = path.join(ROOT, 'skills', 'bootstrapping-context-docs', 'references', 'rules.md');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  assert.match(rulesContent, /11\.\s+\*\*Always log when a task or conversation is done\.\*\*/);
  assert.match(rulesContent, /compact.*30 days/i);

  const agentPath = path.join(ROOT, 'agents', 'engineering-standards.md');
  const agentContent = fs.readFileSync(agentPath, 'utf8');
  assert.match(agentContent, /11\.\s+\*\*Always log when a task or conversation is done\.\*\*/);
  assert.match(agentContent, /compact.*30 days/i);

  const historyPath = path.join(ROOT, 'shared', 'references', 'history-discipline.md');
  const historyContent = fs.readFileSync(historyPath, 'utf8');
  assert.match(historyContent, /The 30-Day Compaction Protocol/);
  assert.match(historyContent, /Always log when a task or conversation is done/);
});

test('CLI compact-changelog command works and respects --dry-run', () => {
  const home = tmpHome();
  const changelogPath = path.join(home, 'CHANGELOG.md');
  const sample = `# Sample — v1 Change Log\n\n## 2025-01-01 — Task: Old task\n**Completed:** Setup.\n**Why:** Init.\n**Affects:** root.\n`;
  fs.writeFileSync(changelogPath, sample, 'utf8');

  // Dry run
  const binPath = path.join(ROOT, 'bin', 'cli.mjs');
  const dryOutput = execFileSync(process.execPath, [binPath, 'compact-changelog', '--file', changelogPath, '--dry-run']).toString();
  assert.match(dryOutput, /Dry run - nothing was written/);
  assert.equal(fs.readFileSync(changelogPath, 'utf8'), sample);

  // Real run
  const realOutput = execFileSync(process.execPath, [binPath, 'compact-changelog', '--file', changelogPath]).toString();
  assert.match(realOutput, /Updated .* successfully/);
  const updated = fs.readFileSync(changelogPath, 'utf8');
  assert.match(updated, /## Compacted History \(> 30 days\)/);
  assert.match(updated, /### 2025-01 \(Compacted\)/);

  fs.rmSync(home, { recursive: true, force: true });
});

console.log('\necosystem & startup team integration');

test('ecosystem registers all 6 categories and 18 upstream integrations', () => {
  assert.equal(Object.keys(ECOSYSTEM_CATEGORIES).length, 6);
  assert.equal(ECOSYSTEM_ITEMS.length, 18);
  const fullTeam = resolveEcosystemSelection('full-team');
  assert.equal(fullTeam.length, 18);
  assert.deepEqual(
    resolveEcosystemSelection('startup').map((i) => i.id),
    fullTeam.map((i) => i.id),
  );
  assert.deepEqual(
    resolveEcosystemSelection('company').map((i) => i.id),
    fullTeam.map((i) => i.id),
  );
});

test('product and growth presets use the exact same unified skill stack', () => {
  const productSkills = resolveEcosystemSelection('product').map((i) => i.id);
  const growthSkills = resolveEcosystemSelection('growth').map((i) => i.id);
  const pgSkills = resolveEcosystemSelection('product-growth').map((i) => i.id);

  assert.deepEqual(productSkills, growthSkills, 'product and growth presets must be identical');
  assert.deepEqual(productSkills, pgSkills, 'product-growth preset must match');
  for (const required of [
    'grill-me',
    'doc-coauthoring',
    'internal-comms',
    'brand-discovery',
    'brand-guidelines',
    'marketingskills',
    'writing-beats',
    'remotion-best-practices',
    'hyperframes',
    'brag',
    'caveman',
  ]) {
    assert.ok(productSkills.includes(required), `missing ${required} in unified product/growth preset`);
  }
});

test('buildEcosystemInstallCommands builds skills-cli and custom-cli commands accurately', () => {
  const items = resolveEcosystemSelection('grill-me,impeccable,caveman');
  const globalCmds = buildEcosystemInstallCommands(items, { targets: ['claude', 'antigravity'], project: false });
  assert.equal(globalCmds.length, 3);

  const grillCmd = globalCmds.find((c) => c.id === 'grill-me');
  assert.match(grillCmd.fullCommand, /npx skills add https:\/\/github\.com\/mattpocock\/skills --skill grill-me -g -a claude-code -a antigravity -y/);

  const impCmd = globalCmds.find((c) => c.id === 'impeccable');
  assert.equal(impCmd.fullCommand, 'npx --yes impeccable install');

  const cavemanCmd = globalCmds.find((c) => c.id === 'caveman');
  assert.equal(cavemanCmd.fullCommand, 'npx --yes @caveman-ai/cli@latest');

  const projCmds = buildEcosystemInstallCommands(items, { targets: ['codex'], project: true });
  const projGrill = projCmds.find((c) => c.id === 'grill-me');
  assert.ok(!projGrill.args.includes('-g'), 'project scope should not include -g');
  assert.ok(projGrill.args.includes('codex'));
});

test('buildEcosystemUpdateCommands updates skills and @latest custom CLIs', () => {
  const cmds = buildEcosystemUpdateCommands({ project: false, includeCustomCli: true });
  assert.equal(cmds.length, 3);
  assert.equal(cmds[0].fullCommand, 'npx skills update -g -y');
  assert.equal(cmds[1].fullCommand, 'npx --yes impeccable@latest install');
  assert.equal(cmds[2].fullCommand, 'npx --yes @caveman-ai/cli@latest');
});

test('every skill ships references/ecosystem.md and points to it in SKILL.md', () => {
  for (const skill of shippedSkills()) {
    const ref = path.join(ROOT, 'skills', skill, 'references', 'ecosystem.md');
    assert.ok(fs.existsSync(ref), `${skill} is missing ecosystem.md`);
    const body = fs.readFileSync(path.join(ROOT, 'skills', skill, 'SKILL.md'), 'utf8');
    assert.match(body, /ecosystem\.md/, `${skill}/SKILL.md never points at ecosystem.md`);
  }
});

test('CLI ecosystem list, ecosystem install --dry-run, and update --dry-run work', () => {
  const binPath = path.join(ROOT, 'bin', 'cli.mjs');
  const listOut = execFileSync(process.execPath, [binPath, 'ecosystem', 'list']).toString();
  assert.match(listOut, /Unified Product & Growth stack/);
  assert.match(listOut, /remotion-best-practices/);
  assert.match(listOut, /writing-beats/);

  const installDry = execFileSync(process.execPath, [binPath, 'ecosystem', 'install', '--bundle', 'product', '--dry-run']).toString();
  assert.match(installDry, /\[dry-run\] npx skills add/);

  const updateDry = execFileSync(process.execPath, [binPath, 'update', '--dry-run']).toString();
  assert.match(updateDry, /npx skills update/);
  assert.match(updateDry, /impeccable@latest install/);
  assert.match(updateDry, /@caveman-ai\/cli@latest/);
});

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
