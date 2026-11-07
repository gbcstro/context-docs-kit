import os from 'node:os';
import path from 'node:path';

/**
 * Where each host looks for Agent Skills, and what it can do once it finds them.
 *
 * All four hosts implement the open Agent Skills standard, so the skill bodies
 * are byte-identical everywhere. Only these paths and capabilities differ.
 *
 * Sources:
 *   Claude Code  https://docs.claude.com/en/docs/claude-code/skills
 *   Codex        https://learn.chatgpt.com/docs/build-skills
 *   Gemini CLI   https://geminicli.com/docs/cli/skills/
 *   Antigravity  https://antigravity.google/docs/skills/
 */
export const TARGETS = {
  claude: {
    label: 'Claude Code',
    userSkills: (home) => path.join(home, '.claude', 'skills'),
    projectSkills: (repo) => path.join(repo, '.claude', 'skills'),
    // Claude Code and Codex get the persona subagents; elsewhere the skill
    // briefs a generic subagent or runs those stages inline (references/hosts.md).
    userAgents: (home) => path.join(home, '.claude', 'agents'),
    projectAgents: (repo) => path.join(repo, '.claude', 'agents'),
    agentFormat: 'md',
    agentFile: 'AGENTS.md',
    supportsImport: true,
  },
  codex: {
    label: 'Codex',
    userSkills: (home) => path.join(home, '.agents', 'skills'),
    projectSkills: (repo) => path.join(repo, '.agents', 'skills'),
    // Codex custom agents: one TOML file each, rendered from agents/*.md
    // (src/agent-format.mjs). https://learn.chatgpt.com/docs/agent-configuration/subagents
    userAgents: (home) => path.join(home, '.codex', 'agents'),
    projectAgents: (repo) => path.join(repo, '.codex', 'agents'),
    agentFormat: 'toml',
    agentFile: 'AGENTS.md',
    supportsImport: false,
  },
  gemini: {
    label: 'Gemini CLI',
    userSkills: (home) => path.join(home, '.gemini', 'skills'),
    projectSkills: (repo) => path.join(repo, '.gemini', 'skills'),
    userAgents: null,
    projectAgents: null,
    agentFile: 'AGENTS.md',
    supportsImport: true,
  },
  antigravity: {
    label: 'Antigravity',
    // ~/.gemini/config/skills is the one global location all three Antigravity
    // flavours (IDE, CLI, agent) read.
    userSkills: (home) => path.join(home, '.gemini', 'config', 'skills'),
    // Shares .agents/skills with Codex at project scope. resolvePlan dedupes.
    projectSkills: (repo) => path.join(repo, '.agents', 'skills'),
    userAgents: null,
    projectAgents: null,
    agentFile: 'AGENTS.md',
    supportsImport: false,
  },
};

export const TARGET_NAMES = Object.keys(TARGETS);
export const DEFAULT_TARGET = 'claude';

/**
 * Parse a --target value into a validated list of target names.
 * Accepts "all", or a comma-separated list. Throws on an unknown name.
 */
export function parseTargets(value) {
  if (!value) return [DEFAULT_TARGET];
  const raw = String(value)
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (raw.includes('all')) return [...TARGET_NAMES];

  const unknown = raw.filter((n) => !TARGET_NAMES.includes(n));
  if (unknown.length) {
    throw new Error(
      `unknown target${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}\n` +
        `       valid targets: ${TARGET_NAMES.join(', ')}, all`,
    );
  }
  return [...new Set(raw)];
}

/**
 * Resolve targets into the concrete directories to write.
 *
 * Codex and Antigravity share <repo>/.agents/skills at project scope, so the
 * plan groups by skills destination: one write, credited to both hosts. Only
 * Codex has an agents dir, so the merged group takes it.
 */
export function resolvePlan(
  targetNames,
  { project = false, home = os.homedir(), cwd = process.cwd() } = {},
) {
  const byDest = new Map();

  for (const name of targetNames) {
    const t = TARGETS[name];
    const skillsDir = project ? t.projectSkills(cwd) : t.userSkills(home);
    const agentsDirFn = project ? t.projectAgents : t.userAgents;
    const agentsDir = agentsDirFn ? agentsDirFn(project ? cwd : home) : null;
    const agentFormat = agentsDir ? t.agentFormat : null;

    const group = byDest.get(skillsDir);
    if (!group) {
      byDest.set(skillsDir, { targets: [name], skillsDir, agentsDir, agentFormat });
    } else {
      group.targets.push(name);
      if (!group.agentsDir && agentsDir) Object.assign(group, { agentsDir, agentFormat });
    }
  }

  return [...byDest.values()];
}

/** Every host with its resolved skill roots, for `list`. */
export function detectHosts({ home = os.homedir(), cwd = process.cwd() } = {}) {
  return TARGET_NAMES.map((name) => ({
    name,
    label: TARGETS[name].label,
    userSkills: TARGETS[name].userSkills(home),
    projectSkills: TARGETS[name].projectSkills(cwd),
  }));
}
