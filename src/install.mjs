import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { resolvePlan, TARGETS } from './targets.mjs';
import { readManifest, writeManifest, removeManifest, MANIFEST_NAME } from './manifest.mjs';

export const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function packageVersion() {
  return JSON.parse(fs.readFileSync(path.join(PKG_ROOT, 'package.json'), 'utf8')).version;
}

/** The skill directories this package ships. */
export function shippedSkills() {
  const dir = path.join(PKG_ROOT, 'skills');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(dir, e.name, 'SKILL.md')))
    .map((e) => e.name)
    .sort();
}

/** The persona agent files this package ships. */
export function shippedAgents() {
  const dir = path.join(PKG_ROOT, 'agents');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort();
}

function hashDir(dir) {
  const h = crypto.createHash('sha256');
  const walk = (d, prefix) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      const abs = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(abs, rel);
      } else if (entry.isFile()) {
        h.update(rel).update('\0').update(fs.readFileSync(abs)).update('\0');
      }
    }
  };
  walk(dir, '');
  return h.digest('hex');
}

function hashFile(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function isLink(p) {
  try {
    return fs.lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * Decide what happens to one destination, without touching disk.
 *
 * "ours" means the manifest at this root already claims the entry, so replacing
 * it is safe. Anything else present is the user's and needs --force.
 */
function classify({ src, dest, name, kind, claimed, link, force }) {
  const exists = fs.existsSync(dest) || isLink(dest);

  if (!exists) return { name, kind, src, dest, action: link ? 'link' : 'create' };

  if (link) {
    if (isLink(dest) && fs.realpathSync(dest) === fs.realpathSync(src)) {
      return { name, kind, src, dest, action: 'current' };
    }
    if (!claimed && !isLink(dest) && !force) {
      return { name, kind, src, dest, action: 'blocked' };
    }
    return { name, kind, src, dest, action: 'relink' };
  }

  if (isLink(dest)) {
    // A link from a previous --link install. Replacing it with a copy is ours to do.
    return { name, kind, src, dest, action: claimed || force ? 'replace' : 'blocked' };
  }

  const same = kind === 'skill' ? hashDir(src) === hashDir(dest) : hashFile(src) === hashFile(dest);
  if (same) return { name, kind, src, dest, action: 'current' };
  if (!claimed && !force) return { name, kind, src, dest, action: 'blocked' };
  return { name, kind, src, dest, action: 'update' };
}

/**
 * Build the full install plan for a set of targets. Pure: no writes.
 */
export function planInstall(targetNames, opts = {}) {
  const { project = false, home, cwd, link = false, force = false } = opts;
  const skills = shippedSkills();
  const agents = shippedAgents();
  const groups = resolvePlan(targetNames, { project, home, cwd });

  return groups.map((group) => {
    const manifest = readManifest(group.skillsDir);
    const claimedSkills = new Set((manifest?.entries ?? []).filter((e) => e.kind === 'skill').map((e) => e.name));

    const items = skills.map((name) =>
      classify({
        src: path.join(PKG_ROOT, 'skills', name),
        dest: path.join(group.skillsDir, name),
        name,
        kind: 'skill',
        claimed: claimedSkills.has(name),
        link,
        force,
      }),
    );

    if (group.agentsDir) {
      const agentManifest = readManifest(group.agentsDir);
      const claimedAgents = new Set(
        (agentManifest?.entries ?? []).filter((e) => e.kind === 'agent').map((e) => e.name),
      );
      for (const file of agents) {
        items.push(
          classify({
            src: path.join(PKG_ROOT, 'agents', file),
            dest: path.join(group.agentsDir, file),
            name: file,
            kind: 'agent',
            claimed: claimedAgents.has(file),
            // Agent files are always copied. Whether a host discovers an agent
            // through a symlink is not something this installer should bet on.
            link: false,
            force,
          }),
        );
      }
    }

    return { ...group, items };
  });
}

function copyDir(src, dest) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(src, dest, { recursive: true });
}

function makeLink(src, dest) {
  if (fs.existsSync(dest) || isLink(dest)) fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.symlinkSync(src, dest, 'junction');
}

/**
 * Execute a plan produced by planInstall.
 */
export function applyInstall(plan, { link = false } = {}) {
  const version = packageVersion();

  for (const group of plan) {
    const written = { skills: [], agents: [] };

    for (const item of group.items) {
      if (item.action === 'blocked') continue;

      if (item.action !== 'current') {
        fs.mkdirSync(path.dirname(item.dest), { recursive: true });
        if (item.kind === 'skill' && link) makeLink(item.src, item.dest);
        else if (item.kind === 'skill') copyDir(item.src, item.dest);
        else fs.copyFileSync(item.src, item.dest);
      }

      const record = { name: item.name, kind: item.kind, linked: item.kind === 'skill' && link };
      if (item.kind === 'skill') written.skills.push(record);
      else written.agents.push(record);
    }

    if (written.skills.length) writeManifest(group.skillsDir, { version, entries: written.skills });
    if (written.agents.length && group.agentsDir) {
      writeManifest(group.agentsDir, { version, entries: written.agents });
    }
  }

  return plan;
}

/**
 * Plan an uninstall. Only manifest-listed entries are ever removed.
 */
export function planUninstall(targetNames, opts = {}) {
  const { project = false, home, cwd } = opts;
  const groups = resolvePlan(targetNames, { project, home, cwd });

  return groups.map((group) => {
    const items = [];

    for (const [root, kind] of [
      [group.skillsDir, 'skill'],
      [group.agentsDir, 'agent'],
    ]) {
      if (!root) continue;
      const manifest = readManifest(root);
      if (!manifest) continue;
      for (const entry of manifest.entries) {
        if (entry.kind !== kind) continue;
        const dest = path.join(root, entry.name);
        items.push({
          name: entry.name,
          kind,
          dest,
          root,
          action: fs.existsSync(dest) || isLink(dest) ? 'remove' : 'missing',
        });
      }
    }

    return { ...group, items };
  });
}

export function applyUninstall(plan) {
  const roots = new Set();

  for (const group of plan) {
    for (const item of group.items) {
      if (item.action === 'remove') fs.rmSync(item.dest, { recursive: true, force: true });
      roots.add(item.root);
    }
  }

  for (const root of roots) removeManifest(root);
  return plan;
}

/** What is installed where, for `list`. */
export function inspect({ home, cwd } = {}) {
  const rows = [];
  for (const name of Object.keys(TARGETS)) {
    for (const project of [false, true]) {
      const [group] = resolvePlan([name], { project, home, cwd });
      const manifest = readManifest(group.skillsDir);
      rows.push({
        target: name,
        label: TARGETS[name].label,
        scope: project ? 'project' : 'user',
        dir: group.skillsDir,
        installed: manifest ? manifest.entries.map((e) => e.name) : [],
        version: manifest?.version ?? null,
        linked: Boolean(manifest?.entries?.some((e) => e.linked)),
      });
    }
  }
  return rows;
}

export { MANIFEST_NAME };
