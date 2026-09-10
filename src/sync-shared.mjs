#!/usr/bin/env node
/**
 * Copy shared/references/*.md into every skill's references/ directory.
 *
 * Skill directories have to be self-contained, because each one is installed on
 * its own. That means the host-adaptation rules, the doc contract, the history
 * discipline and the critic checklist exist as copies inside all three skills.
 *
 * shared/references/ is the single source of truth for those files, and
 * `--check` fails the build if a copy has drifted. This is what stops the
 * duplication problem the kit had before, where a template lived in two places
 * and the two slowly disagreed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHARED = path.join(ROOT, 'shared', 'references');
const SKILLS = path.join(ROOT, 'skills');

function sharedFiles() {
  if (!fs.existsSync(SHARED)) return [];
  return fs.readdirSync(SHARED).filter((f) => f.endsWith('.md')).sort();
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
  const files = sharedFiles();
  const skills = skillDirs();
  const drifted = [];
  let copied = 0;

  for (const skill of skills) {
    const destDir = path.join(SKILLS, skill, 'references');
    for (const file of files) {
      const src = path.join(SHARED, file);
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
    console.error(`shared references in sync (${result.files.length} files x ${result.skills.length} skills)`);
  } else {
    console.log(
      `synced ${result.files.length} shared reference(s) into ${result.skills.length} skill(s)` +
        ` - ${result.copied} file(s) written`,
    );
  }
}
