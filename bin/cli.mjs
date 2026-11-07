#!/usr/bin/env node
import { parseArgs } from 'node:util';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';

import { parseTargets, TARGET_NAMES, TARGETS, DEFAULT_TARGET } from '../src/targets.mjs';
import { planInstall, applyInstall, planUninstall, applyUninstall, inspect, packageVersion } from '../src/install.mjs';
import { compactChangelogFile, findCurrentChangelog } from '../src/compact-changelog.mjs';
import {
  ECOSYSTEM_CATEGORIES,
  ECOSYSTEM_ITEMS,
  TEAM_PRESETS,
  COMPANION_SKILLS,
  findMissingCompanions,
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
  --skip-companions do not offer the ${COMPANION_SKILLS.length} companion skills RULES.md §2.1 routes to
                    (install and update list missing ones and ask before installing)
  -y, --yes         install missing companion skills without asking (scripts and CI;
                    without a terminal and without --yes they are skipped)
  --ecosystem       install the full startup/company ecosystem alongside context-docs-kit
  --bundle <list>   team preset, category, or skill IDs (default with --ecosystem: full-team)
                    presets: ${Object.keys(TEAM_PRESETS).join(', ')}
                    categories: ${Object.keys(ECOSYSTEM_CATEGORIES).join(', ')}
  --copy            copy the skills into every host's directory instead of keeping one
                    copy in .agents/skills and symlinking each host to it (the default)
  --link            link the .agents/skills store back to this package (for developing the kit)
  --force           replace files this tool did not install
  --days <number>   cutoff age in days for compact-changelog (default: 30)
  --file <path>     specific changelog path for compact-changelog
  --dry-run         print what would happen, write nothing
  -h, --help        this text
  -v, --version     print the version

Examples
  npx context-docs-kit install
  npx context-docs-kit install --target all --ecosystem
  npx context-docs-kit install --skip-companions
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
  const hosts = group.targets.length
    ? group.targets.map((n) => TARGETS[n].label).join(' + ') + (group.store ? '  (shared skill store)' : '')
    : 'Shared skill store (.agents/skills)';
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

/**
 * Ask before installing companions: they are third-party code, fetched at
 * their latest upstream version. No terminal to ask on means no, unless the
 * caller passed --yes.
 */
async function confirmCompanions(count, values) {
  if (values.yes) return true;
  if (!process.stdin.isTTY || !process.stdout.isTTY) return false;

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) =>
    rl.question(`Install ${count} missing companion skill(s) from these third-party sources? [Y/n] `, resolve),
  );
  rl.close();
  return ['', 'y', 'yes'].includes(answer.trim().toLowerCase());
}

/**
 * Offer to install whichever companion skills (COMPANION_SKILLS) are missing
 * for these targets and scope. `npx skills add` cannot do this for us, so
 * install and update both offer it unless --skip-companions is passed.
 */
async function runCompanionStep(targets, values) {
  if (values['skip-companions']) return;
  const project = Boolean(values.project);
  const missing = findMissingCompanions(targets, { project });

  if (!missing.length) {
    console.log(`Companion skills: all ${COMPANION_SKILLS.length} present.
`);
    return;
  }

  console.log(
    `Companion skills (${missing.length} missing - required by RULES.md §2.1).
` +
      'These come from third-party repositories and npm, at their latest version:',
  );
  for (const item of missing) console.log(`  - ${item.id.padEnd(22)} ${item.command}`);

  const commands = buildEcosystemInstallCommands(missing, { targets, project, nonInteractive: true });
  if (values['dry-run']) {
    executeEcosystemCommands(commands, { dryRun: true });
    console.log('');
    return;
  }

  if (!(await confirmCompanions(missing.length, values))) {
    const retry = `npx context-docs-kit install --target ${targets.join(',')}${project ? ' --project' : ''} --yes`;
    console.log(
      process.stdin.isTTY && !values.yes
        ? `Skipped. Install them later with: ${retry}
`
        : `Skipped: no terminal to confirm on. Re-run with --yes to install them: ${retry}
`,
    );
    return;
  }

  // Project installs must run in the repo (skills add writes to ./.agents/skills);
  // global ones run from home, away from whatever the current directory holds.
  executeEcosystemCommands(commands, { cwd: project ? process.cwd() : os.homedir() });
  console.log('');
}

async function cmdInstall(values) {
  const targets = values.target ? parseTargets(values.target) : await promptTargets();
  const opts = {
    project: Boolean(values.project),
    link: Boolean(values.link),
    copy: Boolean(values.copy),
    force: Boolean(values.force),
  };
  const plan = planInstall(targets, opts);
  const dryRun = Boolean(values['dry-run']);

  console.log('');
  for (const group of plan) reportGroup(group, { dryRun });

  const hadBlocked = reportBlocked(plan);

  if (!dryRun) {
    applyInstall(plan, { link: opts.link });
  }

  await runCompanionStep(targets, values);

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
    const mode = row.store
      ? row.mode === 'link' ? 'shared store, linked to the package' : 'shared store'
      : { link: 'linked to the package', symlink: 'symlinked to .agents/skills' }[row.mode] ?? 'copied';
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

async function cmdUpdate(values) {
  const dryRun = Boolean(values['dry-run']);
  const installedRows = inspect().filter((r) => r.installed.length);

  console.log('\n1. Updating context-docs-kit core skills & persona agents:');
  if (values.target) {
    const targets = parseTargets(values.target);
    const plan = planInstall(targets, {
      project: Boolean(values.project),
      link: Boolean(values.link),
      copy: Boolean(values.copy),
      force: Boolean(values.force),
    });
    for (const group of plan) reportGroup(group, { dryRun });
    if (!dryRun) applyInstall(plan);
  } else if (installedRows.length) {
    for (const scope of ['user', 'project']) {
      const scopeRows = installedRows.filter((r) => r.scope === scope);
      if (!scopeRows.length) continue;
      const targets = [...new Set(scopeRows.map((r) => r.target))];
      // Keep each install's mode: --link stays linked, --copy stays copied, and
      // anything else (including installs from before the store) moves to symlinks.
      const link = scopeRows.some((r) => r.linked);
      const copy = Boolean(values.copy) || scopeRows.some((r) => r.mode === 'copy');
      const plan = planInstall(targets, { project: scope === 'project', link, copy, force: Boolean(values.force) });
      for (const group of plan) reportGroup(group, { dryRun });
      if (!dryRun) applyInstall(plan);
    }
  } else {
    const plan = planInstall([DEFAULT_TARGET], { project: Boolean(values.project) });
    for (const group of plan) reportGroup(group, { dryRun });
    if (!dryRun) applyInstall(plan);
  }

  console.log('2. Installing missing companion skills:');
  if (values.target) {
    await runCompanionStep(parseTargets(values.target), values);
  } else if (installedRows.length) {
    for (const scope of ['user', 'project']) {
      const scopeRows = installedRows.filter((r) => r.scope === scope);
      if (!scopeRows.length) continue;
      const targets = [...new Set(scopeRows.map((r) => r.target))];
      await runCompanionStep(targets, { ...values, project: scope === 'project' });
    }
  } else {
    await runCompanionStep([DEFAULT_TARGET], values);
  }

  console.log('3. Updating integrated startup/company ecosystem skills to latest upstream versions:');
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
        'skip-companions': { type: 'boolean' },
        yes: { type: 'boolean', short: 'y' },
        bundle: { type: 'string' },
        link: { type: 'boolean' },
        copy: { type: 'boolean' },
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
        return await cmdUpdate(values);
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
