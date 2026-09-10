import fs from 'node:fs';
import path from 'node:path';

export const MANIFEST_NAME = '.context-docs-kit.json';

/**
 * A manifest records exactly what this tool wrote into an install root, so
 * `uninstall` can remove precisely that and nothing else. Without it, removing
 * a skill directory means guessing whether the user hand-edited it.
 */
export function manifestPath(root) {
  return path.join(root, MANIFEST_NAME);
}

export function readManifest(root) {
  const file = manifestPath(root);
  if (!fs.existsSync(file)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.entries)) return null;
    return parsed;
  } catch {
    // A corrupt manifest is treated as absent. Never delete on a guess.
    return null;
  }
}

export function writeManifest(root, { version, entries }) {
  fs.mkdirSync(root, { recursive: true });
  const body = {
    tool: 'context-docs-kit',
    version,
    installedAt: new Date().toISOString(),
    entries: [...entries].sort((a, b) => a.name.localeCompare(b.name)),
  };
  fs.writeFileSync(manifestPath(root), `${JSON.stringify(body, null, 2)}\n`);
}

export function removeManifest(root) {
  const file = manifestPath(root);
  if (fs.existsSync(file)) fs.rmSync(file);
}
