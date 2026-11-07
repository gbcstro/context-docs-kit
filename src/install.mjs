import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { resolvePlan, TARGETS } from './targets.mjs';
import { readManifest, writeManifest, removeManifest, MANIFEST_NAME } from './manifest.mjs';
import { renderAgentFile } from './agent-format.mjs';

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

/** Does the link at `dest` point at `src`? Works before `src` exists, too. */
function linksTo(dest, src) {
  if (!isLink(dest)) return false;
  try {
    if (fs.existsSync(src)) return fs.realpathSync(dest) === fs.realpathSync(src);
    return path.resolve(path.dirname(dest), fs.readlinkSync(dest)) === path.resolve(src);
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
function classify({ src, dest, name, kind, claimed, link, force, content }) {
  const exists = fs.existsSync(dest) || isLink(dest);
  const item = { name, kind, src, dest, content };

  if (!exists) return { ...item, action: link ? 'link' : 'create' };

  if (link) {
    if (linksTo(dest, src)) return { ...item, action: 'current' };
    if (!claimed && !isLink(dest) && !force) return { ...item, action: 'blocked' };
    return { ...item, action: 'relink' };
  }

  if (isLink(dest)) {
    // A link from a previous symlinked install. Replacing it with a copy is ours to do.
    return { ...item, action: claimed || force ? 'replace' : 'blocked' };
  }

  const same =
    kind === 'skill'
      ? hashDir(src) === hashDir(dest)
      : crypto.createHash('sha256').update(content).digest('hex') === hashFile(dest);
  if (same) return { ...item, action: 'current' };
  if (!claimed && !force) return { ...item, action: 'blocked' };
  return { ...item, action: 'update' };
}

/**
 * The shared skill store: `~/.agents/skills` (user) or `<repo>/.agents/skills`
 * (project). It is the canonical location the `skills` CLI uses too, and Codex
 * and Antigravity read it natively.
 */
export function storeDir({ project = false, home = os.homedir(), cwd = process.cwd() } = {}) {
  return path.join(project ? cwd : home, '.agents', 'skills');
}

/**
 * Build the full install plan for a set of targets. Pure: no writes.
 *
 * Default (symlink) mode keeps one real copy of each skill in the store and
 * makes every other host's skills directory a set of links into it, so four
 * hosts cost the disk space of one. `copy: true` writes a full copy per host
 * instead, for filesystems where links are unavailable. `link: true` (developing
 * the kit) makes the store itself link back to this package.
 *
 * The store group always comes first, so the links resolve as soon as they exist.
 */
export function planInstall(targetNames, opts = {}) {
  const { project = false, home = os.homedir(), cwd = process.cwd(), link = false, force = false, copy = false } = opts;
  const skills = shippedSkills();
  const agents = shippedAgents();
  const store = storeDir({ project, home, cwd });
  const groups = resolvePlan(targetNames, { project, home, cwd });

  let storeGroup = groups.find((g) => g.skillsDir === store);
  const hostGroups = groups.filter((g) => g !== storeGroup);
  if (!copy && hostGroups.length && !storeGroup) {
    // Nothing installed here reads the store directly, but the links need it.
    storeGroup = { targets: [], skillsDir: store, agentsDir: null, agentFormat: null };
  }

  const ordered = [storeGroup, ...hostGroups].filter(Boolean);
  const mode = link ? 'link' : copy ? 'copy' : 'symlink';

  return ordered.map((group) => {
    const isStore = group === storeGroup;
    const viaStore = !copy && !isStore;
    const manifest = readManifest(group.skillsDir);
    const claimedSkills = new Set((manifest?.entries ?? []).filter((e) => e.kind === 'skill').map((e) => e.name));

    const items = skills.map((name) =>
      classify({
        src: viaStore ? path.join(store, name) : path.join(PKG_ROOT, 'skills', name),
        dest: path.join(group.skillsDir, name),
        name,
        kind: 'skill',
        claimed: claimedSkills.has(name),
        link: viaStore || link,
        force,
      }),
    );

    if (group.agentsDir) {
      const agentManifest = readManifest(group.agentsDir);
      const claimedAgents = new Set(
        (agentManifest?.entries ?? []).filter((e) => e.kind === 'agent').map((e) => e.name),
      );
      for (const src of agents.map((f) => path.join(PKG_ROOT, 'agents', f))) {
        // Claude Code takes the markdown as-is; Codex gets it rendered as TOML.
        const { file, content } = renderAgentFile(src, group.agentFormat);
        items.push(
          classify({
            src,
            dest: path.join(group.agentsDir, file),
            name: file,
            kind: 'agent',
            content,
            claimed: claimedAgents.has(file),
            // Agent files are always copied. They are a few KB each, Codex's are
            // generated rather than shipped, and whether a host discovers an agent
            // through a symlink is not something this installer should bet on.
            link: false,
            force,
          }),
        );
      }
    }

    return { ...group, store: isStore, storeDir: store, mode, items };
  });
}

function copyDir(src, dest) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(src, dest, { recursive: true });
}

function makeLink(src, dest) {
  if (fs.existsSync(dest) || isLink(dest)) fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  // A junction on Windows: no admin rights or developer mode needed.
  fs.symlinkSync(src, dest, 'junction');
}

/**
 * Execute a plan produced by planInstall.
 *
 * The store's manifest records which targets depend on it, so uninstalling one
 * host never deletes skills another host still links to.
 */
export function applyInstall(plan) {
  const version = packageVersion();

  for (const group of plan) {
    const written = { skills: [], agents: [] };
    const linkMode = group.mode === 'link' || (group.mode === 'symlink' && !group.store);

    for (const item of group.items) {
      if (item.action === 'blocked') continue;

      if (item.action !== 'current') {
        fs.mkdirSync(path.dirname(item.dest), { recursive: true });
        if (item.kind === 'skill' && linkMode) makeLink(item.src, item.dest);
        else if (item.kind === 'skill') copyDir(item.src, item.dest);
        else fs.writeFileSync(item.dest, item.content);
      }

      if (item.kind === 'skill') {
        written.skills.push({
          name: item.name,
          kind: 'skill',
          // `linked` means linked to this package (--link). `via` marks a link into the store.
          linked: group.mode === 'link',
          ...(group.mode === 'symlink' && !group.store ? { via: 'store' } : {}),
        });
      } else {
        written.agents.push({ name: item.name, kind: 'agent', linked: false });
      }
    }

    if (written.skills.length) {
      const previous = readManifest(group.skillsDir);
      const targets = group.store
        ? [...new Set([...(previous?.targets ?? []), ...plan.flatMap((g) => g.targets)])].sort()
        : group.targets;
      writeManifest(group.skillsDir, { version, mode: group.mode, targets, entries: written.skills });
    }
    if (written.agents.length && group.agentsDir) {
      writeManifest(group.agentsDir, { version, entries: written.agents });
    }
  }

  return plan;
}

/**
 * Plan an uninstall. Only manifest-listed entries are ever removed, and the
 * store's skills only once no remaining target depends on them.
 */
export function planUninstall(targetNames, opts = {}) {
  const { project = false, home = os.homedir(), cwd = process.cwd() } = opts;
  const store = storeDir({ project, home, cwd });
  const groups = resolvePlan(targetNames, { project, home, cwd });

  const storeManifest = readManifest(store);
  const remaining = (storeManifest?.targets ?? []).filter((t) => !targetNames.includes(t));
  if (storeManifest && !groups.some((g) => g.skillsDir === store)) {
    groups.unshift({ targets: [], skillsDir: store, agentsDir: null });
  }

  return groups.map((group) => {
    const isStore = group.skillsDir === store;
    const items = [];

    for (const [root, kind] of [
      [group.skillsDir, 'skill'],
      [group.agentsDir, 'agent'],
    ]) {
      if (!root) continue;
      // The store's skills stay while another installed host still uses them.
      if (isStore && kind === 'skill' && remaining.length) continue;
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

    return { ...group, store: isStore, remaining: isStore ? remaining : undefined, items };
  });
}

export function applyUninstall(plan) {
  const roots = new Set();

  for (const group of plan) {
    for (const item of group.items) {
      if (item.action === 'remove') fs.rmSync(item.dest, { recursive: true, force: true });
      roots.add(item.root);
    }
    // A kept store just forgets the targets that left.
    if (group.store && group.remaining?.length) {
      const manifest = readManifest(group.skillsDir);
      if (manifest) writeManifest(group.skillsDir, { ...manifest, targets: group.remaining });
    }
  }

  for (const root of roots) removeManifest(root);
  return plan;
}

/** What is installed where, for `list` and `update`. */
export function inspect({ home = os.homedir(), cwd = process.cwd() } = {}) {
  const rows = [];
  for (const name of Object.keys(TARGETS)) {
    for (const project of [false, true]) {
      const [group] = resolvePlan([name], { project, home, cwd });
      const manifest = readManifest(group.skillsDir);
      // The store's manifest lists the targets it serves; a target sharing that
      // directory (Codex, Antigravity) is installed only if it is on the list.
      const installed = manifest && (!manifest.targets || manifest.targets.includes(name));
      rows.push({
        target: name,
        label: TARGETS[name].label,
        scope: project ? 'project' : 'user',
        dir: group.skillsDir,
        installed: installed ? manifest.entries.map((e) => e.name) : [],
        store: group.skillsDir === storeDir({ project, home, cwd }),
        version: manifest?.version ?? null,
        // Manifests from before the shared store carry no mode; `update` moves those to symlinks.
        mode: manifest?.mode ?? 'legacy',
        linked: Boolean(installed && manifest.entries.some((e) => e.linked)),
      });
    }
  }
  return rows;
}

export { MANIFEST_NAME };
