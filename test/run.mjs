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

import { parseTargets, resolvePlan, TARGET_NAMES } from '../src/targets.mjs';
import { planInstall, applyInstall, planUninstall, applyUninstall, shippedSkills, shippedAgents } from '../src/install.mjs';
import { sync } from '../src/sync-shared.mjs';

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

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
