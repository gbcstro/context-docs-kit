/**
 * Changelog compaction utility for context-docs-kit.
 *
 * Keeps recent entries (within `days`, default 30) granular in the Active Log,
 * and compacts entries older than `days` into monthly summary rollups under
 * the Compacted History section.
 */
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_DAYS = 30;

/**
 * Parse an individual changelog entry's markdown text.
 */
export function parseEntry(raw) {
  const match = raw.match(/^##\s+(\d{4}-\d{2}-\d{2})(?:\s*[-—–]\s*(.*?))?\s*$/m);
  if (!match) return null;

  const dateStr = match[1];
  const title = (match[2] || '').trim();
  const date = new Date(`${dateStr}T00:00:00Z`);

  // Extract common fields
  const changedMatch = raw.match(/\*\*Changed:\*\*\s*([^\n]+(?:\n(?!\*\*)[^\n]+)*)/i);
  const completedMatch = raw.match(/\*\*Completed:\*\*\s*([^\n]+(?:\n(?!\*\*)[^\n]+)*)/i);
  const whyMatch = raw.match(/\*\*Why(?:\s*\/\s*Context)?:\*\*\s*([^\n]+(?:\n(?!\*\*)[^\n]+)*)/i);
  const affectsMatch = raw.match(/\*\*Affects:\*\*\s*([^\n]+(?:\n(?!\*\*)[^\n]+)*)/i);

  const changed = changedMatch ? changedMatch[1].trim() : '';
  const completed = completedMatch ? completedMatch[1].trim() : '';
  const why = whyMatch ? whyMatch[1].trim() : '';
  const affects = affectsMatch ? affectsMatch[1].trim() : '';

  return {
    raw: raw.trim(),
    dateStr,
    date,
    title,
    changed,
    completed,
    why,
    affects,
  };
}

/**
 * Format a single compacted bullet point from a parsed entry.
 */
export function formatCompactedBullet(entry) {
  const label = entry.title ? `${entry.title}` : 'Update';
  const summary = entry.completed || entry.changed || 'Completed task or doc revision';
  const cleanSummary = summary.replace(/\.+$/, '');
  const whyPart = entry.why ? ` — Why: ${entry.why.replace(/\.+$/, '')}` : '';
  const affectsPart = entry.affects ? ` Affects: ${entry.affects.replace(/\.+$/, '')}.` : '';

  return `- **${entry.dateStr} (${label}):** ${cleanSummary}.${whyPart}.${affectsPart}`.replace(/\.\.+/g, '.');
}

/**
 * Parse existing compacted history into structured month groups.
 */
function parseExistingCompacted(body) {
  const months = new Map();
  const miscellaneous = [];

  if (!body) return { months, miscellaneous };

  const sections = body.split(/\n(?=###\s+)/);

  for (const sec of sections) {
    const trimmed = sec.trim();
    if (!trimmed) continue;

    const monthMatch = trimmed.match(/^###\s+(\d{4}-\d{2})(?:\s+\(Compacted\))?\s*\n([\s\S]*)$/i);
    if (monthMatch) {
      const monthKey = monthMatch[1];
      const content = monthMatch[2].trim();
      const bullets = content
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.startsWith('-') || l.startsWith('*'));

      if (!months.has(monthKey)) {
        months.set(monthKey, []);
      }
      months.get(monthKey).push(...bullets);
    } else if (trimmed !== '_No compacted entries yet (all changes within active window)._') {
      miscellaneous.push(trimmed);
    }
  }

  return { months, miscellaneous };
}

/**
 * Compact a changelog string.
 *
 * @param {string} content - Markdown content of a single-file changelog (legacy CHANGELOG_vN.md or ./CHANGELOG.md)
 * @param {object} [options]
 * @param {number} [options.days=30] - Cutoff age in days
 * @param {Date} [options.now=new Date()] - Reference date
 * @returns {{ content: string, compactedCount: number, activeCount: number }}
 */
export function compactChangelog(content, { days = DEFAULT_DAYS, now = new Date() } = {}) {
  const normalized = content.replace(/\r\n/g, '\n');
  const nowMs = now.getTime();
  const msPerDay = 24 * 60 * 60 * 1000;

  // Split out top-level title and intro before any ## sections
  const firstH2Index = normalized.search(/\n##\s+/);
  let header = '';
  let rest = '';

  if (firstH2Index === -1) {
    header = normalized.trim();
    rest = '';
  } else {
    header = normalized.slice(0, firstH2Index).trim();
    rest = normalized.slice(firstH2Index);
  }

  if (!header) {
    header = '# Change Log';
  }

  // Check if there is an existing Compacted History section
  const compactedSectionRegex = /\n##\s+(?:Compacted History|Archive)[^\n]*\n([\s\S]*)$/i;
  const compactedMatch = rest.match(compactedSectionRegex);

  let existingCompactedBody = '';
  let activePortion = rest;

  if (compactedMatch) {
    existingCompactedBody = compactedMatch[1].trim();
    activePortion = rest.slice(0, compactedMatch.index);
  }

  // Remove any "## Active Log..." heading from activePortion
  activePortion = activePortion.replace(/\n##\s+Active Log[^\n]*\n/gi, '\n');

  // Parse entries in the active portion. Entries start with "## YYYY-MM-DD"
  const entryBlocks = [];
  const entryRegex = /(?:^|\n)(##\s+\d{4}-\d{2}-\d{2}[^\n]*\n[\s\S]*?)(?=(?:\n##\s+\d{4}-\d{2}-\d{2}|$))/g;

  let match;
  while ((match = entryRegex.exec(activePortion)) !== null) {
    const block = match[1].trim();
    if (block) {
      const parsed = parseEntry(block);
      if (parsed) entryBlocks.push(parsed);
    }
  }

  const activeEntries = [];
  const { months: allCompactedMonths, miscellaneous } = parseExistingCompacted(existingCompactedBody);

  let newlyCompactedCount = 0;

  for (const entry of entryBlocks) {
    const ageDays = (nowMs - entry.date.getTime()) / msPerDay;
    if (ageDays > days) {
      const month = entry.dateStr.slice(0, 7); // 'YYYY-MM'
      if (!allCompactedMonths.has(month)) {
        allCompactedMonths.set(month, []);
      }
      allCompactedMonths.get(month).push(formatCompactedBullet(entry));
      newlyCompactedCount += 1;
    } else {
      activeEntries.push(entry);
    }
  }

  // Rebuild the markdown
  const out = [];
  out.push(header);
  out.push('');
  out.push('## Active Log (Last 30 Days)');
  out.push('');

  if (activeEntries.length === 0) {
    out.push('_No entries in the active 30-day window._');
  } else {
    for (let i = 0; i < activeEntries.length; i++) {
      out.push(activeEntries[i].raw);
      if (i < activeEntries.length - 1) out.push('');
    }
  }

  out.push('');
  out.push('---');
  out.push('');
  out.push('## Compacted History (> 30 days)');
  out.push('');

  const sortedMonths = [...allCompactedMonths.keys()].sort().reverse();

  if (sortedMonths.length === 0 && miscellaneous.length === 0) {
    out.push('_No compacted entries yet (all changes within active window)._');
  } else {
    for (const month of sortedMonths) {
      out.push(`### ${month} (Compacted)`);
      out.push('');
      for (const bullet of allCompactedMonths.get(month)) {
        out.push(bullet);
      }
      out.push('');
    }

    for (const misc of miscellaneous) {
      out.push(misc);
      out.push('');
    }
  }

  return {
    content: out.join('\n').trim() + '\n',
    compactedCount: newlyCompactedCount,
    activeCount: activeEntries.length,
  };
}

/**
 * Compact a changelog file on disk.
 */
export function compactChangelogFile(filePath, { days = DEFAULT_DAYS, now = new Date(), dryRun = false } = {}) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Changelog file not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const result = compactChangelog(raw, { days, now });

  if (!dryRun && result.compactedCount > 0) {
    fs.writeFileSync(filePath, result.content, 'utf8');
  }

  return result;
}

const DAY_FILE = /^(\d{4}-\d{2}-\d{2})\.md$/;

/**
 * Compact a per-day changelog folder (context/PROGRESS/v<N>/changelog/).
 * Day files (YYYY-MM-DD.md) older than `days` become one bullet per entry in
 * the month's rollup (YYYY-MM.md), then the day file is deleted.
 */
export function compactChangelogDir(dir, { days = DEFAULT_DAYS, now = new Date(), dryRun = false } = {}) {
  if (!fs.existsSync(dir)) throw new Error(`Changelog folder not found: ${dir}`);
  const msPerDay = 24 * 60 * 60 * 1000;
  const version = path.basename(path.dirname(dir));
  const months = new Map();
  const oldFiles = [];
  let compactedCount = 0;
  let activeCount = 0;

  for (const file of fs.readdirSync(dir).sort()) {
    const m = file.match(DAY_FILE);
    if (!m) continue;
    const dateStr = m[1];
    const ageDays = (now.getTime() - new Date(`${dateStr}T00:00:00Z`).getTime()) / msPerDay;
    const body = fs.readFileSync(path.join(dir, file), 'utf8').replace(/\r\n/g, '\n');
    const blocks = body.split(/\n(?=##\s)/).filter((b) => /^##\s/.test(b.trim()));
    if (ageDays <= days) {
      activeCount += blocks.length;
      continue;
    }
    const month = dateStr.slice(0, 7);
    if (!months.has(month)) months.set(month, []);
    for (const block of blocks) {
      // Day-file headings carry only the title; the date comes from the file name.
      const entry = parseEntry(block.trim().replace(/^##\s+/, `## ${dateStr} — `));
      if (entry) months.get(month).push(formatCompactedBullet(entry));
      compactedCount += 1;
    }
    oldFiles.push(path.join(dir, file));
  }

  if (!dryRun) {
    for (const [month, bullets] of months) {
      const rollup = path.join(dir, `${month}.md`);
      const existing = fs.existsSync(rollup)
        ? fs.readFileSync(rollup, 'utf8').trimEnd()
        : `# ${version} — ${month} (Compacted)\n`;
      fs.writeFileSync(rollup, `${existing}\n${bullets.join('\n')}\n`, 'utf8');
    }
    for (const file of oldFiles) fs.rmSync(file);
  }

  return { compactedCount, activeCount, months: [...months.keys()].sort() };
}

/**
 * Locate the current version's changelog: the highest
 * context/PROGRESS/v<N>/changelog/ folder, else a legacy
 * context/PROGRESS/CHANGELOG_v<N>.md file, else ./CHANGELOG.md.
 */
export function findCurrentChangelog(cwd = process.cwd()) {
  const progressDir = path.join(cwd, 'context', 'PROGRESS');
  if (fs.existsSync(progressDir)) {
    const byVersion = (re) =>
      fs
        .readdirSync(progressDir)
        .filter((f) => re.test(f))
        .sort((a, b) => Number.parseInt(b.match(/\d+/)[0], 10) - Number.parseInt(a.match(/\d+/)[0], 10));

    const folder = byVersion(/^v\d+$/i).map((v) => path.join(progressDir, v, 'changelog')).find((d) => fs.existsSync(d));
    if (folder) return folder;

    const legacy = byVersion(/^CHANGELOG_v\d+\.md$/i);
    if (legacy.length > 0) return path.join(progressDir, legacy[0]);
  }

  const rootChangelog = path.join(cwd, 'CHANGELOG.md');
  if (fs.existsSync(rootChangelog)) {
    return rootChangelog;
  }

  return null;
}
