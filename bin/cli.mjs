#!/usr/bin/env node
import { parseArgs } from 'node:util';
import path from 'node:path';
import readline from 'node:readline';

import { parseTargets, TARGET_NAMES, TARGETS, DEFAULT_TARGET } from '../src/targets.mjs';
import { planInstall, applyInstall, planUninstall, applyUninstall, inspect, packageVersion } from '../src/install.mjs';
import { compactChangelogFile, findCurrentChangelog } from '../src/compact-changelog.mjs';
import {
  ECOSYSTEM_CATEGORIES,
  ECOSYSTEM_ITEMS,
  TEAM_PRESETS,
  resolveEcosystemSelection,
  buildEcosystemInstallCommands,
  buildEcosystemUpdateCommands,
  executeEcosystemCommands,
} from '../src/ecosystem.mjs';

const USAGE = `
context-docs-kit ${packageVersion()}

  Bootstraps and maintains a project's context/ foundation docs, integrated with
  the Full-Team Startup & Company Skill Ecosystem (Documentation, Dev Workflow,
  UI/Brand, Marketing/SEO, Token Saving, and Video Generation).
  Installs into Claude Code, Codex, Gemini CLI or Antigravity.

Usage
  npx context-docs-kit install           [options]
  npx context-docs-kit update            [options]
  npx context-docs-kit ecosystem         [list|install|update] [options]
  npx context-docs-kit uninstall         [options]
  npx context-docs-kit list
  npx context-docs-kit compact-changelog [options]

Options
  --target <list>   ${TARGET_NAMES.join(', ')}, or all      (default: ${DEFAULT_TARGET})
  --project         install/update in this repo instead of your home directory
  --ecosystem       install the full startup/company ecosystem alongside context-docs-kit
  --bundle <list>   team preset, category, or skill IDs (default with --ecosystem: full-team)
                    presets: ${Object.keys(TEAM_PRESETS).join(', ')}
                    categories: ${Object.keys(ECOSYSTEM_CATEGORIES).join(', ')}
  --link            symlink the skills instead of copying them (for developing the kit)
  --force           replace files this tool did not install
  --days <number>   cutoff age in days for compact-changelog (default: 30)
  --file <path>     specific changelog path for compact-changelog
  --dry-run         print what would happen, write nothing
  -h, --help        this text
  -v, --version     print the version

Examples
  npx context-docs-kit install
  npx context-docs-kit install --target all --ecosystem
  npx context-docs-kit install --target all --bundle startup --project
  npx context-docs-kit install --bundle product,design
  npx context-docs-kit update
  npx context-docs-kit ecosystem list
  npx context-docs-kit ecosystem install --bundle full-team
  npx context-docs-kit ecosystem update
  npx context-docs-kit compact-changelog --days 30
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

function runEcosystemInstallStep(targets, values) {
  const selection = values.bundle || 'full-team';
  const items = resolveEcosystemSelection(selection);
  const project = Boolean(values.project);
  const dryRun = Boolean(values['dry-run']);

  console.log(`\nEcosystem bundle (${selection} — ${items.length} integration(s)):`);
  const commands = buildEcosystemInstallCommands(items, { targets, project, nonInteractive: true });
  executeEcosystemCommands(commands, { dryRun });
  console.log('');
}

async function cmdInstall(values) {
  const targets = values.target ? parseTargets(values.target) : await promptTargets();
  const opts = { project: Boolean(values.project), link: Boolean(values.link), force: Boolean(values.force) };
  const plan = planInstall(targets, opts);
  const dryRun = Boolean(values['dry-run']);

  console.log('');
  for (const group of plan) reportGroup(group, { dryRun });

  const hadBlocked = reportBlocked(plan);

  if (!dryRun) {
    applyInstall(plan, { link: opts.link });
  }

  if (values.ecosystem || values.bundle) {
    runEcosystemInstallStep(targets, values);
  }

  if (dryRun) {
    console.log('Dry run - nothing was written.');
    return;
  }

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

function cmdEcosystemList() {
  console.log(`\ncontext-docs-kit — Startup & Company Team Skill Ecosystem\n`);
  console.log(`Team Presets (--bundle <preset>):`);
  for (const [name, preset] of Object.entries(TEAM_PRESETS)) {
    console.log(`  ${name.padEnd(16)} ${preset.description}`);
  }

  console.log('');
  for (const cat of Object.values(ECOSYSTEM_CATEGORIES)) {
    console.log(`${cat.label} (${cat.id}) — powers ${cat.docs.join(', ')}`);
    const catItems = ECOSYSTEM_ITEMS.filter((i) => i.category === cat.id);
    for (const item of catItems) {
      console.log(`  - ${item.id.padEnd(24)} ${item.command}`);
      console.log(`    ${''.padEnd(24)} ${item.summary}`);
    }
    console.log('');
  }
}

function cmdEcosystem(positionals, values) {
  const sub = (positionals[1] || 'list').toLowerCase();

  if (sub === 'list' || sub === 'ls') {
    return cmdEcosystemList();
  }

  if (sub === 'install' || sub === 'add' || sub === 'i') {
    const targets = parseTargets(values.target || 'all');
    return runEcosystemInstallStep(targets, values);
  }

  if (sub === 'update' || sub === 'up' || sub === 'upgrade') {
    const dryRun = Boolean(values['dry-run']);
    const project = Boolean(values.project);
    console.log(`\nUpdating external ecosystem skills & CLI tools (${project ? 'project' : 'global'} scope):`);
    const commands = buildEcosystemUpdateCommands({ project, includeCustomCli: true });
    executeEcosystemCommands(commands, { dryRun });
    if (dryRun) {
      console.log('\nDry run - nothing was executed.');
    } else {
      console.log('\nEcosystem skills and CLI tools updated to latest upstream versions.');
    }
    return;
  }

  return fail(`unknown ecosystem subcommand: ${sub} (expected list, install, or update)`);
}

function cmdUpdate(values) {
  const dryRun = Boolean(values['dry-run']);
  const installedRows = inspect().filter((r) => r.installed.length);

  console.log('\n1. Updating context-docs-kit core skills & persona agents:');
  if (values.target) {
    const targets = parseTargets(values.target);
    const plan = planInstall(targets, {
      project: Boolean(values.project),
      link: Boolean(values.link),
      force: Boolean(values.force),
    });
    for (const group of plan) reportGroup(group, { dryRun });
    if (!dryRun) applyInstall(plan, { link: Boolean(values.link) });
  } else if (installedRows.length) {
    for (const scope of ['user', 'project']) {
      const scopeRows = installedRows.filter((r) => r.scope === scope);
      if (!scopeRows.length) continue;
      const targets = [...new Set(scopeRows.map((r) => r.target))];
      const linked = scopeRows.some((r) => r.linked);
      const plan = planInstall(targets, { project: scope === 'project', link: linked, force: Boolean(values.force) });
      for (const group of plan) reportGroup(group, { dryRun });
      if (!dryRun) applyInstall(plan, { link: linked });
    }
  } else {
    const plan = planInstall([DEFAULT_TARGET], { project: Boolean(values.project) });
    for (const group of plan) reportGroup(group, { dryRun });
    if (!dryRun) applyInstall(plan);
  }

  console.log('2. Updating integrated startup/company ecosystem skills to latest upstream versions:');
  const commands = buildEcosystemUpdateCommands({
    project: Boolean(values.project),
    bothScopes: !values.project && installedRows.some((r) => r.scope === 'project'),
    includeCustomCli: true,
  });
  executeEcosystemCommands(commands, { dryRun });

  if (dryRun) {
    console.log('\nDry run - nothing was written.');
  } else {
    console.log('\nAll context-docs-kit and ecosystem skills are up to date.');
  }
}

function cmdCompactChangelog(values) {
  const filePath = values.file || findCurrentChangelog();
  if (!filePath) {
    return fail('no changelog found in context/PROGRESS/ or current directory. Specify one with --file <path>');
  }

  const days = values.days ? Number.parseInt(values.days, 10) : 30;
  if (Number.isNaN(days) || days < 1) {
    return fail(`invalid --days value: ${values.days}`);
  }

  const dryRun = Boolean(values['dry-run']);
  const result = compactChangelogFile(filePath, { days, dryRun });

  console.log(`\nCompacting ${filePath} (entries older than ${days} days):`);
  console.log(`  Compacted: ${result.compactedCount} entry/entries`);
  console.log(`  Active:    ${result.activeCount} entry/entries`);

  if (dryRun) {
    console.log('\nDry run - nothing was written.');
  } else if (result.compactedCount > 0) {
    console.log(`\nUpdated ${filePath} successfully.`);
  } else {
    console.log('\nAll entries are within the active window. No compaction needed.');
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
        ecosystem: { type: 'boolean' },
        bundle: { type: 'string' },
        link: { type: 'boolean' },
        force: { type: 'boolean' },
        days: { type: 'string' },
        file: { type: 'string' },
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
      case 'update':
      case 'up':
      case 'upgrade':
        return cmdUpdate(values);
      case 'ecosystem':
      case 'eco':
      case 'skills':
        return cmdEcosystem(positionals, values);
      case 'uninstall':
      case 'remove':
        return cmdUninstall(values);
      case 'list':
      case 'ls':
        return cmdList();
      case 'compact-changelog':
      case 'compact':
        return cmdCompactChangelog(values);
      default:
        return fail(`unknown command: ${command}\n${USAGE}`);
    }
  } catch (err) {
    fail(err.message);
  }
}

main();
