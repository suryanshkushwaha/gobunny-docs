/**
 * One-shot migration: Docusaurus markdown -> MDX for the Next.js site.
 *
 * Five jobs, all mechanical. No prose is rewritten:
 *   1. .md -> .mdx, first H1 lifted into frontmatter (title/description/order)
 *   2. relative ../foo/01-bar.md links -> /foo/bar routes
 *   3. :::note[Good to know] admonitions -> <Callout title="Good to know">
 *   4. _category_.json files -> lib/docs/sections.ts
 *   5. stray { } in prose escaped, or MDX parses them as JSX expressions
 *
 * Run once, then read `git diff`. Idempotent: re-running over .mdx is a no-op.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

import {
  DOCS_DIR,
  annotateFences,
  fileToRoute,
  mapOutsideInlineCode,
  orderFromPrefix,
  stripInlineMarkdown,
  walkDocs,
} from './lib/content-utils.mjs';

const stats = {
  files: 0,
  links: 0,
  callouts: 0,
  braces: 0,
  categories: 0,
};

// ---------------------------------------------------------------------------
// 1. Title / description / order
// ---------------------------------------------------------------------------

function extractTitle(body) {
  for (const { line, inFence } of annotateFences(body)) {
    if (inFence) continue;
    const match = line.match(/^#\s+(.+?)\s*$/);
    if (match) return stripInlineMarkdown(match[1]);
  }
  return null;
}

/** Drop the first H1 and the blank line under it; the page shell renders it. */
function removeFirstH1(body) {
  const lines = body.split('\n');
  const annotated = annotateFences(body);
  for (let i = 0; i < lines.length; i++) {
    if (annotated[i].inFence) continue;
    if (/^#\s+.+$/.test(lines[i])) {
      lines.splice(i, lines[i + 1]?.trim() === '' ? 2 : 1);
      break;
    }
  }
  return lines.join('\n');
}

/** First real paragraph, flattened — used for <meta> and search snippets. */
function extractDescription(body) {
  const paragraph = [];
  for (const { line, inFence } of annotateFences(body)) {
    if (inFence) continue;
    const trimmed = line.trim();
    if (!trimmed) {
      if (paragraph.length) break;
      continue;
    }
    // Skip anything that is not running prose.
    if (/^(#{1,6}\s|[-*+]\s|\d+\.\s|\||:::|<|>|→)/.test(trimmed)) {
      if (paragraph.length) break;
      continue;
    }
    paragraph.push(trimmed);
  }
  if (!paragraph.length) return null;

  const text = stripInlineMarkdown(paragraph.join(' '));
  if (text.length <= 180) return text;
  const cut = text.slice(0, 180);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

// ---------------------------------------------------------------------------
// 2. Links
// ---------------------------------------------------------------------------

function rewriteLinks(body, sourceFile, routes) {
  const sourceDir = path.posix.dirname(sourceFile);

  return annotateFences(body)
    .map(({ line, inFence }) => {
      if (inFence) return line;
      return mapOutsideInlineCode(line, (chunk) =>
        chunk.replace(/\]\(([^)\s]+)\)/g, (whole, target) => {
          // Leave external links and same-page anchors alone.
          if (/^(https?:|mailto:|#|\/)/.test(target)) return whole;
          if (!/\.mdx?($|#)/.test(target)) return whole;

          const [rawPath, anchor] = target.split('#');
          const resolved = path.posix.normalize(
            path.posix.join(sourceDir, rawPath),
          );
          const route = fileToRoute(resolved);
          if (!routes.has(route)) {
            throw new Error(
              `${sourceFile}: link "${target}" resolves to ${route}, which is not a route`,
            );
          }
          stats.links++;
          return `](${route}${anchor ? `#${anchor}` : ''})`;
        }),
      );
    })
    .join('\n');
}

// ---------------------------------------------------------------------------
// 3. Admonitions
// ---------------------------------------------------------------------------

function convertAdmonitions(body) {
  const out = [];
  let open = null;

  for (const { line, inFence, isFence } of annotateFences(body)) {
    if (inFence && !isFence) {
      out.push(line);
      continue;
    }

    const start = !open && line.match(/^:::(\w+)(?:\[([^\]]*)\])?\s*$/);
    if (start) {
      open = start[1];
      const title = start[2];
      const variant = open === 'note' ? '' : ` variant="${open}"`;
      out.push(`<Callout${variant}${title ? ` title="${title}"` : ''}>`);
      stats.callouts++;
      continue;
    }

    if (open && /^:::\s*$/.test(line)) {
      out.push('</Callout>');
      open = null;
      continue;
    }

    out.push(line);
  }

  if (open) throw new Error(`unterminated ::: block (${open})`);
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// 5. Brace escaping
// ---------------------------------------------------------------------------

/**
 * Docusaurus parsed these files as CommonMark (`format: 'detect'`), so `{` was
 * literal text. MDX reads `{` as the start of a JSX expression, which is a
 * parse error on lines like `**Join {business name}**`. Escaping renders an
 * identical `{` without the JSX meaning.
 */
function escapeBraces(body) {
  return annotateFences(body)
    .map(({ line, inFence }) => {
      if (inFence) return line;
      return mapOutsideInlineCode(line, (chunk) =>
        chunk.replace(/(?<!\\)[{}]/g, (brace) => {
          stats.braces++;
          return `\\${brace}`;
        }),
      );
    })
    .join('\n');
}

// ---------------------------------------------------------------------------
// 4. Categories
// ---------------------------------------------------------------------------

function migrateCategories() {
  const sections = [];
  for (const entry of fs.readdirSync(DOCS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const jsonPath = path.posix.join(DOCS_DIR, entry.name, '_category_.json');
    if (!fs.existsSync(jsonPath)) continue;
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    sections.push({
      slug: entry.name,
      label: data.label,
      order: data.position,
      description: data.link?.description ?? '',
    });
    fs.rmSync(jsonPath);
    stats.categories++;
  }
  sections.sort((a, b) => a.order - b.order);

  const file = `// Generated from the Docusaurus _category_.json files by
// scripts/migrate-content.mjs. Hand-edit freely from here on — this is the
// source of truth for section labels, ordering and landing-page copy.

export type DocSection = {
  slug: string;
  label: string;
  order: number;
  description: string;
};

export const sections: DocSection[] = ${JSON.stringify(sections, null, 2)};

export const sectionBySlug = new Map(sections.map((s) => [s.slug, s]));
`;
  fs.mkdirSync('lib/docs', { recursive: true });
  fs.writeFileSync('lib/docs/sections.ts', file);
  return sections;
}

// ---------------------------------------------------------------------------
// Driver
// ---------------------------------------------------------------------------

const mdFiles = walkDocs(DOCS_DIR, ['.md']);
if (!mdFiles.length) {
  console.log('No .md files left in docs/ — already migrated.');
  process.exit(0);
}

// The full route table, needed up front so link rewriting can verify targets.
const routes = new Set(mdFiles.map(fileToRoute));
for (const entry of fs.readdirSync(DOCS_DIR, { withFileTypes: true })) {
  if (entry.isDirectory()) routes.add(`/${entry.name}`);
}

for (const file of mdFiles) {
  const raw = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const { data: frontmatter, content } = matter(raw);

  const title = extractTitle(content);
  if (!title) throw new Error(`${file}: no H1 to use as a title`);

  let body = removeFirstH1(content);
  const description = extractDescription(body);

  body = convertAdmonitions(body);
  body = rewriteLinks(body, file, routes);
  body = escapeBraces(body);

  const basename = path.posix.basename(file, '.md');
  const order =
    frontmatter.sidebar_position ?? orderFromPrefix(basename) ?? 999;

  const fields = [
    `title: ${JSON.stringify(title)}`,
    description ? `description: ${JSON.stringify(description)}` : null,
    `order: ${order}`,
    frontmatter.sidebar_label
      ? `sidebarLabel: ${JSON.stringify(frontmatter.sidebar_label)}`
      : null,
  ].filter(Boolean);

  const output = `---\n${fields.join('\n')}\n---\n${body.replace(/^\n*/, '\n')}`;

  fs.writeFileSync(file.replace(/\.md$/, '.mdx'), output);
  fs.rmSync(file);
  stats.files++;
}

const sections = migrateCategories();

console.log(`Migrated ${stats.files} files to .mdx`);
console.log(`  links rewritten     ${stats.links}`);
console.log(`  callouts converted  ${stats.callouts}`);
console.log(`  braces escaped      ${stats.braces}`);
console.log(`  sections written    ${stats.categories} -> lib/docs/sections.ts`);
console.log(`  routes in table     ${routes.size}`);
console.log(`\nSections: ${sections.map((s) => s.label).join(', ')}`);
