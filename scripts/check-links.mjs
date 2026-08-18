/**
 * Fails the build on a broken internal link, a dangling anchor, or MDX syntax
 * that would only blow up later. Docusaurus did this with
 * `onBrokenLinks: 'throw'`; this is the replacement.
 *
 * Runs in `prebuild`, so a bad link can never ship.
 */
import fs from 'node:fs';
import matter from 'gray-matter';

import {
  DOCS_DIR,
  annotateFences,
  fileToRoute,
  headingSlugs,
  mapOutsideInlineCode,
  walkDocs,
} from './lib/content-utils.mjs';

const files = walkDocs(DOCS_DIR, ['.mdx']);
const problems = [];

// Route table: one route per page, plus the eight section landing pages.
const routes = new Set(files.map(fileToRoute));
for (const entry of fs.readdirSync(DOCS_DIR, { withFileTypes: true })) {
  if (entry.isDirectory()) routes.add(`/${entry.name}`);
}

// Anchors available on each route.
const anchors = new Map();
const parsed = new Map();
for (const file of files) {
  const { data, content } = matter(fs.readFileSync(file, 'utf8'));
  const route = fileToRoute(file);
  parsed.set(route, { file, data, content });
  anchors.set(route, new Set(headingSlugs(content).map((h) => h.id)));
}
// Section landing pages render headings for each child page.
for (const route of routes) {
  if (!anchors.has(route)) anchors.set(route, new Set());
}

for (const [route, { file, data, content }] of parsed) {
  // --- frontmatter --------------------------------------------------------
  if (!data.title) problems.push(`${file}: missing frontmatter title`);
  if (!data.description) problems.push(`${file}: missing frontmatter description`);
  if (typeof data.order !== 'number') problems.push(`${file}: missing numeric order`);

  for (const { line, inFence } of annotateFences(content)) {
    if (inFence) continue;

    // --- leftover Docusaurus syntax ---------------------------------------
    if (/^:::/.test(line.trim())) {
      problems.push(`${file}: leftover admonition "${line.trim()}"`);
    }

    // --- MDX parse hazards ------------------------------------------------
    mapOutsideInlineCode(line, (chunk) => {
      if (/(?<!\\)[{}]/.test(chunk)) {
        problems.push(`${file}: unescaped brace in prose — "${line.trim()}"`);
      }
      return chunk;
    });

    // --- links ------------------------------------------------------------
    mapOutsideInlineCode(line, (chunk) => {
      for (const [, target] of chunk.matchAll(/\]\(([^)\s]+)\)/g)) {
        if (/^(https?:|mailto:)/.test(target)) continue;

        if (/\.mdx?($|#)/.test(target)) {
          problems.push(`${file}: unrewritten markdown link "${target}"`);
          continue;
        }

        const [targetPath, anchor] = target.split('#');
        const targetRoute = targetPath || route;

        if (!routes.has(targetRoute)) {
          problems.push(`${file}: link "${target}" -> unknown route ${targetRoute}`);
          continue;
        }
        if (anchor && !anchors.get(targetRoute)?.has(anchor)) {
          problems.push(`${file}: link "${target}" -> no heading #${anchor} on ${targetRoute}`);
        }
      }
      return chunk;
    });
  }
}

if (problems.length) {
  console.error(`\ncheck-links: ${problems.length} problem(s)\n`);
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  console.error('');
  process.exit(1);
}

const linkCount = [...parsed.values()].reduce(
  (total, { content }) => total + [...content.matchAll(/\]\(([^)\s]+)\)/g)].length,
  0,
);

console.log(
  `check-links   ${routes.size} routes · ${linkCount} links · ` +
    `${[...anchors.values()].reduce((n, s) => n + s.size, 0)} anchors — all resolve`,
);
