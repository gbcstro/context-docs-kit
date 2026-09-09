#!/usr/bin/env node
import { parseArgs } from 'node:util';
import path from 'node:path';
import readline from 'node:readline';

import { parseTargets, TARGET_NAMES, TARGETS, DEFAULT_TARGET } from '../src/targets.mjs';
import { planInstall, applyInstall, planUninstall, applyUninstall, inspect, packageVersion } from '../src/install.mjs';

const USAGE = `
context-docs-kit ${packageVersion()}

  Bootstraps and maintains a project's context/ foundation docs. Installs as an
  Agent Skill into Claude Code, Codex, Gemini CLI or Antigravity.

Usage
  npx context-docs-kit install   [options]
  npx context-docs-kit uninstall [options]
  npx context-docs-kit list

Options
  --target <list>   ${TARGET_NAMES.join(', ')}, or all      (default: ${DEFAULT_TARGET})
  --project         install into this repo instead of your home directory
  --link            symlink the skills instead of copying them (for developing the kit)
  --force           replace files this tool did not install
  --dry-run         print what would happen, write nothing
  -h, --help        this text
  -v, --version     print the version

Examples
  npx context-docs-kit install
  npx context-docs-kit install --target codex
  npx context-docs-kit install --target claude,gemini
  npx context-docs-kit install --target all --project
`.trimStart();

const ACTION_LABEL = {
  create: 'installed',
  update: 'updated',
  replace: 'replaced',
  link: 'linked',
  relink: 'relinked',
  current: 'already current',
  blocked: 'SKIPPED',
  remove: 'removed',
  missing: 'already gone',
};

function fail(message) {
  console.error(`context-docs-kit: ${message}`);
  process.exit(1);
}

async function promptTargets() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) return [DEFAULT_TARGET];

  console.log('Which assistants should this be installed for?\n');
  TARGET_NAMES.forEach((name, i) => {
    const mark = name === DEFAULT_TARGET ? ' (default)' : '';
    console.log(`  ${i + 1}. ${TARGETS[name].label}${mark}`);
  });
  console.log(`  a. all of them\n`);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) =>
    rl.question(`Numbers, comma separated [${TARGET_NAMES.indexOf(DEFAULT_TARGET) + 1}]: `, resolve),
  );
  rl.close();
  console.log('');

  const trimmed = answer.trim().toLowerCase();
  if (!trimmed) return [DEFAULT_TARGET];
  if (trimmed === 'a' || trimmed === 'all') return [...TARGET_NAMES];

  const picked = trimmed
    .split(',')
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= TARGET_NAMES.length)
    .map((n) => TARGET_NAMES[n - 1]);

  return picked.length ? [...new Set(picked)] : [DEFAULT_TARGET];
}

function reportGroup(group, { dryRun }) {
  const hosts = group.targets.map((n) => TARGETS[n].label).join(' + ');
  console.log(`${hosts}`);
  console.log(`  ${group.skillsDir}`);

  const skills = group.items.filter((i) => i.kind === 'skill');
  const agents = group.items.filter((i) => i.kind === 'agent');

  for (const item of skills) {
    console.log(`    ${dryRun ? 'would be ' : ''}${ACTION_LABEL[item.action]}  ${item.name}`);
  }

  if (agents.length) {
    console.log(`  ${path.dirname(agents[0].dest)}`);
    const counts = agents.reduce((acc, i) => ({ ...acc, [i.action]: (acc[i.action] ?? 0) + 1 }), {});
    for (const [action, n] of Object.entries(counts)) {
      console.log(`    ${dryRun ? 'would be ' : ''}${ACTION_LABEL[action]}  ${n} persona agent(s)`);
    }
  }

  console.log('');
}

function reportBlocked(plan) {
  const blocked = plan.flatMap((g) => g.items.filter((i) => i.action === 'blocked'));
  if (!blocked.length) return false;

  console.error('Some destinations already exist and were not written by this tool:\n');
  for (const item of blocked) console.error(`  ${item.dest}`);
  console.error('\nMove them, or re-run with --force if they are disposable.\n');
  return true;
}

async function cmdInstall(values) {
  const targets = values.target ? parseTargets(values.target) : await promptTargets();
  const opts = { project: Boolean(values.project), link: Boolean(values.link), force: Boolean(values.force) };
  const plan = planInstall(targets, opts);
  const dryRun = Boolean(values['dry-run']);

  console.log('');
  for (const group of plan) reportGroup(group, { dryRun });

  const hadBlocked = reportBlocked(plan);

  if (dryRun) {
    console.log('Dry run - nothing was written.');
    return;
  }

  applyInstall(plan, { link: opts.link });

  const restarts = [...new Set(plan.flatMap((g) => g.targets).map((n) => TARGETS[n].label))];
  console.log(`Restart ${restarts.join(' / ')} to pick up the skills.`);
  console.log('Then ask: "set up the context docs for this project"');

  if (hadBlocked) process.exitCode = 1;
}

function cmdUninstall(values) {
  const targets = parseTargets(values.target);
  const plan = planUninstall(targets, { project: Boolean(values.project) });
  const dryRun = Boolean(values['dry-run']);

  const total = plan.reduce((n, g) => n + g.items.length, 0);
  console.log('');

  if (!total) {
    console.log('Nothing installed by context-docs-kit was found at those locations.\n');
    return;
  }

  for (const group of plan) reportGroup(group, { dryRun });

  if (dryRun) {
    console.log('Dry run - nothing was removed.');
    return;
  }

  applyUninstall(plan);
  console.log('Removed. Anything not installed by this tool was left alone.');
}

function cmdList() {
  const rows = inspect().filter((r) => r.installed.length);

  console.log('');
  if (!rows.length) {
    console.log('context-docs-kit is not installed anywhere yet.');
    console.log('Run: npx context-docs-kit install\n');
    return;
  }

  for (const row of rows) {
    const mode = row.linked ? 'linked' : 'copied';
    console.log(`${row.label}  (${row.scope}, ${mode}, v${row.version})`);
    console.log(`  ${row.dir}`);
    for (const name of row.installed) console.log(`    ${name}`);
    console.log('');
  }
}

async function main() {
  let parsed;
  try {
    parsed = parseArgs({
      allowPositionals: true,
      options: {
        target: { type: 'string' },
        project: { type: 'boolean' },
        link: { type: 'boolean' },
        force: { type: 'boolean' },
        'dry-run': { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
        version: { type: 'boolean', short: 'v' },
      },
    });
  } catch (err) {
    fail(err.message);
  }

  const { values, positionals } = parsed;
  const command = positionals[0];

  if (values.version) return console.log(packageVersion());
  if (values.help || !command) return console.log(USAGE);

  try {
    switch (command) {
      case 'install':
      case 'i':
        return await cmdInstall(values);
      case 'uninstall':
      case 'remove':
        return cmdUninstall(values);
      case 'list':
      case 'ls':
        return cmdList();
      default:
        return fail(`unknown command: ${command}\n${USAGE}`);
    }
  } catch (err) {
    fail(err.message);
  }
}

main();
