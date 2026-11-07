#!/usr/bin/env node
/**
 * Copy shared/references/*.md into every skill's references/ directory.
 *
 * Skill directories have to be self-contained, because each one is installed on
 * its own. That means the host-adaptation rules, the doc contract, the history
 * discipline and the critic checklist exist as copies inside all three skills.
 *
 * The persona agents get the same treatment: agents/*.md is copied into every
 * skill's agents/ directory. `npx skills add` installs skill folders only and
 * never the plugin-level agents/, so without these copies a skills-CLI user has
 * no persona definitions at all. With them, a host that can dispatch a generic
 * subagent briefs it from the copy (references/hosts.md, Degradation 1).
 *
 * shared/references/ and agents/ are the single sources of truth, and
 * `--check` fails the build if a copy has drifted. This is what stops the
 * duplication problem the kit had before, where a template lived in two places
 * and the two slowly disagreed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS = path.join(ROOT, 'skills');

/** Source directory -> the subdirectory of every skill it is copied into. */
const SOURCES = [
  { src: path.join(ROOT, 'shared', 'references'), sub: 'references' },
  { src: path.join(ROOT, 'agents'), sub: 'agents' },
];

function mdFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
}

function skillDirs() {
  if (!fs.existsSync(SKILLS)) return [];
  return fs
    .readdirSync(SKILLS, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(SKILLS, e.name, 'SKILL.md')))
    .map((e) => e.name)
    .sort();
}

export function sync({ check = false } = {}) {
  const skills = skillDirs();
  const files = [];
  const drifted = [];
  let copied = 0;

  for (const source of SOURCES) for (const file of mdFiles(source.src)) files.push({ ...source, file });

  for (const skill of skills) {
    for (const { src: srcDir, sub, file } of files) {
      const destDir = path.join(SKILLS, skill, sub);
      const src = path.join(srcDir, file);
      const dest = path.join(destDir, file);
      const srcBody = fs.readFileSync(src, 'utf8');
      const same = fs.existsSync(dest) && fs.readFileSync(dest, 'utf8') === srcBody;

      if (same) continue;

      if (check) {
        drifted.push(path.relative(ROOT, dest));
      } else {
        fs.mkdirSync(destDir, { recursive: true });
        fs.writeFileSync(dest, srcBody);
        copied += 1;
      }
    }
  }

  return { files, skills, copied, drifted };
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const check = process.argv.includes('--check');
  const result = sync({ check });

  if (check) {
    if (result.drifted.length) {
      console.error('shared references are out of sync:');
      for (const f of result.drifted) console.error(`  ${f}`);
      console.error('\nrun: npm run sync');
      process.exit(1);
    }
    console.error(`shared references and agents in sync (${result.files.length} files x ${result.skills.length} skills)`);
  } else {
    console.log(
      `synced ${result.files.length} shared reference/agent file(s) into ${result.skills.length} skill(s)` +
        ` - ${result.copied} file(s) written`,
    );
  }
}
