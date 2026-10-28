import { spawnSync } from 'node:child_process';
import { TARGET_NAMES } from './targets.mjs';

/**
 * Map context-docs-kit target names to `npx skills` `--agent` identifiers.
 */
export const TARGET_TO_SKILLS_AGENT = {
  claude: 'claude-code',
  codex: 'codex',
  gemini: 'gemini-cli',
  antigravity: 'antigravity',
};

/**
 * The 6 startup/company skill ecosystem pillars integrated with context-docs-kit.
 */
export const ECOSYSTEM_CATEGORIES = {
  documentation: {
    id: 'documentation',
    label: 'Documentation & Internal Comms',
    description: 'Collaborative spec/RFC co-authoring and company-wide internal communications, 3P updates, and release notes.',
    docs: ['PRODUCT.md', 'ARCHITECTURE.md', 'PROGRESS_vN.md', 'CHANGELOG_vN.md'],
  },
  'dev-workflow': {
    id: 'dev-workflow',
    label: 'Dev Workflow, Testing & Interrogation',
    description: 'Relentless requirement grilling, disciplined TDD/superpowers execution, Playwright webapp E2E testing, context orchestration, and custom skill creation.',
    docs: ['ARCHITECTURE.md', 'RULES.md', 'PROGRESS_vN.md'],
  },
  'ui-design': {
    id: 'ui-design',
    label: 'UI Principles, Brand & Frontend Craft',
    description: 'Sequenced 4-layer UI pipeline: Brand guidelines -> Anti-slop taste calibration -> Frontend component construction -> Impeccable polish.',
    docs: ['DESIGN.md', 'PRODUCT.md', 'RULES.md'],
  },
  'marketing-seo': {
    id: 'marketing-seo',
    label: 'Marketing, SEO & Brand Discovery',
    description: 'Unified with Product: brand discovery, positioning, conversion rate optimization (CRO), copywriting, SEO, and GTM launch playbooks.',
    docs: ['PRODUCT.md', 'DESIGN.md'],
  },
  'tokens-saving': {
    id: 'tokens-saving',
    label: 'Token Saving & Context Efficiency',
    description: 'Ultra-compressed token-efficient agent communication paired with present-tense docs and 30-day changelog compaction.',
    docs: ['RULES.md', 'AGENTS.md', 'CHANGELOG_vN.md'],
  },
  'video-generation': {
    id: 'video-generation',
    label: 'Video Generation, Social/Web Media & Brag Docs',
    description: '4-step media pipeline: Brag evidence harvesting -> Beat-Sheet scripting -> Remotion (code video) or Hyperframes (AI video) -> SocMed/web launch copy.',
    docs: ['PRODUCT.md', 'DESIGN.md', 'PROGRESS_vN.md', 'CHANGELOG_vN.md'],
  },
};

/**
 * Canonical registry of external skills and CLI tools integrated into context-docs-kit.
 * All entries pull directly from their upstream Git repositories or `@latest` npm packages
 * so teams always receive the newest upstream versions.
 */
export const ECOSYSTEM_ITEMS = [
  // 1. Documentation
  {
    id: 'doc-coauthoring',
    category: 'documentation',
    kind: 'skills-cli',
    packageSpec: 'anthropics/skills@doc-coauthoring',
    repo: 'anthropics/skills',
    skill: 'doc-coauthoring',
    command: 'npx skills add anthropics/skills@doc-coauthoring',
    roles: ['product', 'growth', 'engineering', 'leadership'],
    docs: ['PRODUCT.md', 'ARCHITECTURE.md', 'RULES.md'],
    summary: 'Structured collaborative co-authoring for foundation docs, RFCs, ADRs, and technical specs.',
  },
  {
    id: 'internal-comms',
    category: 'documentation',
    kind: 'skills-cli',
    packageSpec: 'anthropics/skills@internal-comms',
    repo: 'anthropics/skills',
    skill: 'internal-comms',
    command: 'npx skills add anthropics/skills@internal-comms',
    roles: ['product', 'growth', 'engineering', 'leadership', 'ops'],
    docs: ['PROGRESS_vN.md', 'CHANGELOG_vN.md'],
    summary: 'Turns CHANGELOG_vN and PROGRESS_vN milestones into 3P updates, company newsletters, incident reports, and release notes.',
  },

  // 2. Dev Workflow
  {
    id: 'using-superpowers',
    category: 'dev-workflow',
    kind: 'skills-cli',
    packageSpec: 'obra/superpowers@using-superpowers',
    repo: 'obra/superpowers',
    skill: 'using-superpowers',
    command: 'npx skills add obra/superpowers@using-superpowers',
    roles: ['engineering'],
    docs: ['ARCHITECTURE.md', 'RULES.md', 'PROGRESS_vN.md'],
    summary: 'Enforces disciplined engineering workflows: step-by-step planning, TDD, and systematic root-cause debugging.',
  },
  {
    id: 'webapp-testing',
    category: 'dev-workflow',
    kind: 'skills-cli',
    packageSpec: 'anthropics/skills@webapp-testing',
    repo: 'anthropics/skills',
    skill: 'webapp-testing',
    command: 'npx skills add anthropics/skills@webapp-testing',
    roles: ['engineering', 'qa', 'design'],
    docs: ['ARCHITECTURE.md', 'RULES.md', 'PROGRESS_vN.md'],
    summary: 'Playwright browser testing to verify live web UI behavior and provide concrete evidence before ticking PROGRESS_vN acceptance criteria.',
  },
  {
    id: 'skill-creator',
    category: 'dev-workflow',
    kind: 'skills-cli',
    packageSpec: 'anthropics/skills@skill-creator',
    repo: 'anthropics/skills',
    skill: 'skill-creator',
    command: 'npx skills add anthropics/skills@skill-creator',
    roles: ['engineering', 'ops'],
    docs: ['RULES.md', 'AGENTS.md'],
    summary: 'Creates and refines custom project-scoped agent skills when repeatable team workflows or runbooks emerge in RULES.md.',
  },
  {
    id: 'ponytail',
    category: 'dev-workflow',
    kind: 'skills-cli',
    packageSpec: 'DietrichGebert/ponytail',
    repo: 'DietrichGebert/ponytail',
    skill: null,
    command: 'npx skills add DietrichGebert/ponytail',
    roles: ['engineering'],
    docs: ['ARCHITECTURE.md', 'RULES.md'],
    summary: 'Structured developer workflow and context management across multi-step engineering tasks.',
  },
  {
    id: 'grill-me',
    category: 'dev-workflow',
    kind: 'skills-cli',
    packageSpec: 'https://github.com/mattpocock/skills',
    repo: 'https://github.com/mattpocock/skills',
    skill: 'grill-me',
    command: 'npx skills add https://github.com/mattpocock/skills --skill grill-me',
    roles: ['product', 'growth', 'engineering', 'design', 'leadership'],
    docs: ['PRODUCT.md', 'ARCHITECTURE.md', 'SCHEMA.md', 'DESIGN.md', 'RULES.md'],
    summary: 'Relentless single-question interrogation tree that walks every branch of a design or plan until shared understanding is reached.',
  },

  // 3. UI Principles and Approaches
  {
    id: 'design-taste-frontend',
    category: 'ui-design',
    kind: 'skills-cli',
    packageSpec: 'Leonxlnx/taste-skill@design-taste-frontend',
    repo: 'Leonxlnx/taste-skill',
    skill: 'design-taste-frontend',
    command: 'npx skills add Leonxlnx/taste-skill@design-taste-frontend',
    roles: ['design', 'engineering'],
    docs: ['DESIGN.md', 'RULES.md'],
    summary: 'Anti-slop frontend design taste calibration with strict pre-flight checks, layout variance, and visual hierarchy.',
  },
  {
    id: 'frontend-design',
    category: 'ui-design',
    kind: 'skills-cli',
    packageSpec: 'anthropics/skills@frontend-design',
    repo: 'anthropics/skills',
    skill: 'frontend-design',
    command: 'npx skills add anthropics/skills@frontend-design',
    roles: ['design', 'engineering'],
    docs: ['DESIGN.md', 'RULES.md'],
    summary: 'Production-grade frontend implementation with distinctive typography, semantic tokens, and cohesive aesthetic direction.',
  },
  {
    id: 'brand-guidelines',
    category: 'ui-design',
    kind: 'skills-cli',
    packageSpec: 'anthropics/skills@brand-guidelines',
    repo: 'anthropics/skills',
    skill: 'brand-guidelines',
    command: 'npx skills add anthropics/skills@brand-guidelines',
    roles: ['design', 'product', 'growth'],
    docs: ['DESIGN.md', 'PRODUCT.md'],
    summary: 'Enforces consistent brand identity, color ramps, typography, and visual voice across UI components, web pages, and social videos.',
  },
  {
    id: 'impeccable',
    category: 'ui-design',
    kind: 'custom-cli',
    packageSpec: 'impeccable',
    repo: 'impeccable',
    skill: null,
    command: 'npx impeccable install',
    updateCommand: 'npx impeccable@latest install',
    roles: ['design', 'engineering'],
    docs: ['DESIGN.md', 'RULES.md'],
    summary: 'Impeccable UI/UX design craft, interaction polish, and component quality verification.',
  },

  // 4. Marketing & SEO
  {
    id: 'marketingskills',
    category: 'marketing-seo',
    kind: 'skills-cli',
    packageSpec: 'coreyhaines31/marketingskills',
    repo: 'coreyhaines31/marketingskills',
    skill: null,
    command: 'npx skills add coreyhaines31/marketingskills',
    roles: ['product', 'growth', 'leadership'],
    docs: ['PRODUCT.md', 'DESIGN.md'],
    summary: 'Full-funnel marketing skills inside PRODUCT.md: CRO, copywriting, programmatic & technical SEO, analytics, pricing, and GTM launch playbooks.',
  },
  {
    id: 'brand-discovery',
    category: 'marketing-seo',
    kind: 'skills-cli',
    packageSpec: 'https://github.com/affaan-m/ECC',
    repo: 'https://github.com/affaan-m/ECC',
    skill: 'brand-discovery',
    command: 'npx skills add https://github.com/affaan-m/ECC --skill brand-discovery',
    roles: ['product', 'growth', 'design', 'leadership'],
    docs: ['PRODUCT.md', 'DESIGN.md'],
    summary: 'Extracts brand positioning, audience psychology, differentiation narrative, and voice directly into PRODUCT.md and DESIGN.md.',
  },

  // 5. Tokens Saving
  {
    id: 'caveman',
    category: 'tokens-saving',
    kind: 'custom-cli',
    packageSpec: '@caveman-ai/cli@latest',
    repo: '@caveman-ai/cli',
    skill: null,
    command: 'npx @caveman-ai/cli@latest',
    updateCommand: 'npx @caveman-ai/cli@latest',
    roles: ['engineering', 'product', 'growth', 'design', 'all'],
    docs: ['RULES.md', 'AGENTS.md', 'CHANGELOG_vN.md'],
    summary: 'Cuts LLM output and context token usage via terse, high-signal communication alongside 30-day changelog compaction.',
  },

  // 6. Video Generation
  {
    id: 'remotion-best-practices',
    category: 'video-generation',
    kind: 'skills-cli',
    packageSpec: 'https://github.com/remotion-dev/skills',
    repo: 'https://github.com/remotion-dev/skills',
    skill: 'remotion-best-practices',
    command: 'npx skills add https://github.com/remotion-dev/skills --skill remotion-best-practices',
    roles: ['product', 'growth', 'design', 'engineering'],
    docs: ['PRODUCT.md', 'DESIGN.md', 'PROGRESS_vN.md'],
    summary: 'Programmatic React/Remotion video engineering for website hero demos, social media reels (16:9 & 9:16), and release teasers using DESIGN.md tokens.',
  },
  {
    id: 'brag',
    category: 'video-generation',
    kind: 'skills-cli',
    packageSpec: 'https://github.com/NousResearch/hermes-agent',
    repo: 'https://github.com/NousResearch/hermes-agent',
    skill: 'brag',
    command: 'npx skills add https://github.com/NousResearch/hermes-agent --skill brag',
    roles: ['product', 'growth', 'engineering', 'leadership'],
    docs: ['PROGRESS_vN.md', 'CHANGELOG_vN.md'],
    summary: 'Synthesizes shipped commits, ticked PROGRESS_vN criteria, and CHANGELOG_vN entries into brag docs, sprint demos, and social proof.',
  },
  {
    id: 'hyperframes',
    category: 'video-generation',
    kind: 'skills-cli',
    packageSpec: 'heygen-com/hyperframes',
    repo: 'heygen-com/hyperframes',
    skill: null,
    command: 'npx skills add heygen-com/hyperframes',
    roles: ['product', 'growth', 'design'],
    docs: ['PRODUCT.md', 'DESIGN.md'],
    summary: 'HeyGen Hyperframes integration for high-converting AI video production, avatar presenters, and motion storyboards for social media & web.',
  },
  {
    id: 'writing-beats',
    category: 'video-generation',
    kind: 'skills-cli',
    packageSpec: 'https://github.com/mattpocock/skills',
    repo: 'https://github.com/mattpocock/skills',
    skill: 'writing-beats',
    command: 'npx skills add https://github.com/mattpocock/skills --skill writing-beats',
    roles: ['product', 'growth', 'leadership'],
    docs: ['PRODUCT.md', 'PROGRESS_vN.md'],
    summary: 'Powers the Beat-Sheet Gate: scripts social media reels, website hero videos, and technical explainers into tight narrative beats before rendering.',
  },
];

const UNIFIED_PRODUCT_GROWTH_ITEMS = [
  'grill-me',
  'doc-coauthoring',
  'internal-comms',
  'brand-discovery',
  'brand-guidelines',
  'marketingskills',
  'writing-beats',
  'remotion-best-practices',
  'hyperframes',
  'brag',
  'caveman',
];

/**
 * Startup & company team presets so a team can install the entire stack or scope by pod.
 * Product & Growth use the exact same unified skill stack because brand and GTM live on the product.
 */
export const TEAM_PRESETS = {
  'full-team': {
    label: 'Full Startup / Company Team (All 6 Pillars)',
    description: 'Complete 18-tool stack across Documentation, Dev Workflow, UI/Brand, Marketing/SEO, Token Saving, and Video Generation.',
    categories: [
      'documentation',
      'dev-workflow',
      'ui-design',
      'marketing-seo',
      'tokens-saving',
      'video-generation',
    ],
  },
  startup: {
    label: 'Startup All-in-One (Alias for full-team)',
    description: 'Complete 18-tool stack for fast-moving startup teams.',
    categories: [
      'documentation',
      'dev-workflow',
      'ui-design',
      'marketing-seo',
      'tokens-saving',
      'video-generation',
    ],
  },
  company: {
    label: 'Company / Enterprise Team (Alias for full-team)',
    description: 'Complete 18-tool stack for cross-functional company teams.',
    categories: [
      'documentation',
      'dev-workflow',
      'ui-design',
      'marketing-seo',
      'tokens-saving',
      'video-generation',
    ],
  },
  all: {
    label: 'All Ecosystem Skills',
    description: 'Every integrated skill and CLI across all 6 categories.',
    categories: [
      'documentation',
      'dev-workflow',
      'ui-design',
      'marketing-seo',
      'tokens-saving',
      'video-generation',
    ],
  },
  product: {
    label: 'Product, Brand & Growth Pod (Unified)',
    description: 'Unified Product & Growth stack: grill-me, brand-discovery, brand-guidelines, marketingskills, doc-coauthoring, internal-comms, video suite (writing-beats, remotion, hyperframes, brag), and caveman.',
    items: UNIFIED_PRODUCT_GROWTH_ITEMS,
  },
  growth: {
    label: 'Product, Brand & Growth Pod (Unified — same as product)',
    description: 'Unified Product & Growth stack: brand-discovery, brand-guidelines, marketingskills, grill-me, doc-coauthoring, internal-comms, video suite (writing-beats, remotion, hyperframes, brag), and caveman.',
    items: UNIFIED_PRODUCT_GROWTH_ITEMS,
  },
  'product-growth': {
    label: 'Product, Brand & Growth Pod (Unified)',
    description: 'Unified Product & Growth stack combining product strategy, brand identity, SEO/CRO, internal comms, and video/social media generation.',
    items: UNIFIED_PRODUCT_GROWTH_ITEMS,
  },
  engineering: {
    label: 'Engineering & QA Pod',
    description: 'Dev workflow, Playwright webapp testing, superpowers, ponytail, skill-creator, grill-me, doc co-authoring, internal comms, brag docs, and token saving.',
    items: [
      'doc-coauthoring',
      'internal-comms',
      'using-superpowers',
      'webapp-testing',
      'skill-creator',
      'ponytail',
      'grill-me',
      'caveman',
      'brag',
    ],
  },
  design: {
    label: 'Design, Brand & Frontend Pod',
    description: '4-layer UI craft (brand-guidelines -> design-taste-frontend -> frontend-design -> impeccable), brand-discovery, Remotion video, visual webapp testing, grill-me, and caveman.',
    items: [
      'brand-guidelines',
      'design-taste-frontend',
      'frontend-design',
      'impeccable',
      'brand-discovery',
      'webapp-testing',
      'remotion-best-practices',
      'grill-me',
      'caveman',
    ],
  },
  video: {
    label: 'Social Media & Website Video Production Pod',
    description: 'Complete media pipeline: brag -> writing-beats -> remotion-best-practices & hyperframes + brand-guidelines, design-taste-frontend, marketingskills, and caveman.',
    items: [
      'writing-beats',
      'remotion-best-practices',
      'hyperframes',
      'brag',
      'brand-guidelines',
      'design-taste-frontend',
      'marketingskills',
      'caveman',
    ],
  },
};

/**
 * Resolve a comma-separated selection of presets, categories, or item IDs into
 * a deduplicated list of ECOSYSTEM_ITEMS. Defaults to 'full-team' if omitted or 'true'.
 */
export function resolveEcosystemSelection(selection = 'full-team') {
  const normalized =
    selection === true || !selection || String(selection).trim() === ''
      ? 'full-team'
      : String(selection).trim().toLowerCase();

  const tokens = normalized
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const pickedIds = new Set();
  const unknown = [];

  for (const token of tokens) {
    if (TEAM_PRESETS[token]) {
      const preset = TEAM_PRESETS[token];
      if (preset.categories) {
        for (const item of ECOSYSTEM_ITEMS) {
          if (preset.categories.includes(item.category)) pickedIds.add(item.id);
        }
      } else if (preset.items) {
        for (const id of preset.items) pickedIds.add(id);
      }
      continue;
    }

    if (ECOSYSTEM_CATEGORIES[token]) {
      for (const item of ECOSYSTEM_ITEMS) {
        if (item.category === token) pickedIds.add(item.id);
      }
      continue;
    }

    const match = ECOSYSTEM_ITEMS.find((i) => i.id === token);
    if (match) {
      pickedIds.add(match.id);
      continue;
    }

    unknown.push(token);
  }

  if (unknown.length) {
    const validPresets = Object.keys(TEAM_PRESETS).join(', ');
    const validCategories = Object.keys(ECOSYSTEM_CATEGORIES).join(', ');
    const validIds = ECOSYSTEM_ITEMS.map((i) => i.id).join(', ');
    throw new Error(
      `unknown ecosystem selection: ${unknown.join(', ')}\n` +
        `       valid presets: ${validPresets}\n` +
        `       valid categories: ${validCategories}\n` +
        `       valid skill IDs: ${validIds}`,
    );
  }

  return ECOSYSTEM_ITEMS.filter((i) => pickedIds.has(i.id));
}

/**
 * Convert context-docs-kit target list into `npx skills` `-a` agent flags.
 */
export function mapTargetsToSkillsAgents(targetNames = TARGET_NAMES) {
  return [...new Set(targetNames.map((t) => TARGET_TO_SKILLS_AGENT[t]).filter(Boolean))];
}

/**
 * Build the concrete CLI commands to install a list of ecosystem items.
 *
 * When `nonInteractive` is true (default for automated batch runs), passes `-y`
 * and `-a <agents>` to `npx skills add`, plus `-g` when installing globally (`project === false`).
 */
export function buildEcosystemInstallCommands(
  items,
  { targets = TARGET_NAMES, project = false, nonInteractive = true } = {},
) {
  const agents = mapTargetsToSkillsAgents(targets);

  return items.map((item) => {
    if (item.kind === 'skills-cli') {
      const args = ['skills', 'add', item.packageSpec];
      if (item.skill && !item.packageSpec.includes('@')) {
        args.push('--skill', item.skill);
      }
      if (!project) {
        args.push('-g');
      }
      if (nonInteractive) {
        for (const agent of agents) {
          args.push('-a', agent);
        }
        args.push('-y');
      }
      return {
        id: item.id,
        category: item.category,
        kind: item.kind,
        displayCommand: item.command,
        executable: 'npx',
        args,
        fullCommand: `npx ${args.join(' ')}`,
      };
    }

    // Custom CLI installers (e.g. `npx impeccable install`, `npx @caveman-ai/cli@latest`)
    const parts = item.command.replace(/^npx\s+/, '').split(/\s+/);
    return {
      id: item.id,
      category: item.category,
      kind: item.kind,
      displayCommand: item.command,
      executable: 'npx',
      args: ['--yes', ...parts],
      fullCommand: `npx --yes ${parts.join(' ')}`,
    };
  });
}

/**
 * Build the commands that keep all ecosystem skills and CLI tools always updated.
 *
 * 1. `npx skills update` (-p for project scope or -g for global scope, -y for non-interactive)
 *    fetches the latest upstream commits for all 16 `skills`-managed items.
 * 2. Re-runs `@latest` installers for custom CLI tools (`impeccable`, `@caveman-ai/cli`)
 *    so they stay on their newest published versions.
 */
export function buildEcosystemUpdateCommands({
  project = false,
  bothScopes = false,
  includeCustomCli = true,
} = {}) {
  const commands = [];

  if (bothScopes) {
    commands.push({
      id: 'skills-update-global',
      category: 'all',
      kind: 'skills-update',
      displayCommand: 'npx skills update -g -y',
      executable: 'npx',
      args: ['skills', 'update', '-g', '-y'],
      fullCommand: 'npx skills update -g -y',
    });
    commands.push({
      id: 'skills-update-project',
      category: 'all',
      kind: 'skills-update',
      displayCommand: 'npx skills update -p -y',
      executable: 'npx',
      args: ['skills', 'update', '-p', '-y'],
      fullCommand: 'npx skills update -p -y',
    });
  } else {
    const scopeFlag = project ? '-p' : '-g';
    commands.push({
      id: `skills-update-${project ? 'project' : 'global'}`,
      category: 'all',
      kind: 'skills-update',
      displayCommand: `npx skills update ${scopeFlag} -y`,
      executable: 'npx',
      args: ['skills', 'update', scopeFlag, '-y'],
      fullCommand: `npx skills update ${scopeFlag} -y`,
    });
  }

  if (includeCustomCli) {
    for (const item of ECOSYSTEM_ITEMS.filter((i) => i.kind === 'custom-cli')) {
      const raw = item.updateCommand || item.command;
      const parts = raw.replace(/^npx\s+/, '').split(/\s+/);
      commands.push({
        id: item.id,
        category: item.category,
        kind: item.kind,
        displayCommand: raw,
        executable: 'npx',
        args: ['--yes', ...parts],
        fullCommand: `npx --yes ${parts.join(' ')}`,
      });
    }
  }

  return commands;
}

/**
 * Execute a list of ecosystem commands sequentially.
 */
export function executeEcosystemCommands(commands, { dryRun = false, cwd = process.cwd(), logger = console } = {}) {
  const results = [];

  for (const cmd of commands) {
    if (dryRun) {
      logger.log(`  [dry-run] ${cmd.fullCommand}`);
      results.push({ ...cmd, status: 'dry-run', exitCode: 0 });
      continue;
    }

    logger.log(`  -> Running: ${cmd.displayCommand}`);
    const res = spawnSync(cmd.executable, cmd.args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    const ok = res.status === 0;
    results.push({
      ...cmd,
      status: ok ? 'ok' : 'failed',
      exitCode: res.status ?? 1,
    });

    if (!ok) {
      logger.error(`     [warning] command exited with status ${res.status ?? 1}: ${cmd.displayCommand}`);
    }
  }

  return results;
}

