import fs from 'node:fs';
import path from 'node:path';
import GithubSlugger from 'github-slugger';

export const DOCS_DIR = 'docs';

/** Every .md/.mdx file under docs/, as posix paths, sorted. */
export function walkDocs(dir = DOCS_DIR, exts = ['.md', '.mdx']) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.posix.join(dir.split(path.sep).join('/'), entry.name);
      if (entry.isDirectory()) return walkDocs(full, exts);
      return exts.includes(path.extname(entry.name)) ? [full] : [];
    })
    .sort();
}

/**
 * docs/properties/02-rooms.md -> /properties/rooms
 * docs/index.md               -> /
 *
 * The NN- prefixes order the sidebar and are stripped from the URL. Keeping
 * that rule keeps every published URL working.
 */
export function fileToRoute(file) {
  const rel = file
    .replace(/^docs\//, '')
    .replace(/\.mdx?$/, '');
  const parts = rel.split('/').map(stripOrderPrefix);
  const joined = parts.join('/');
  return joined === 'index' ? '/' : `/${joined}`;
}

export function stripOrderPrefix(segment) {
  return segment.replace(/^\d+-/, '');
}

export function orderFromPrefix(segment) {
  const match = segment.match(/^(\d+)-/);
  return match ? Number(match[1]) : null;
}

/**
 * Walks a markdown body tracking fenced code blocks, so callers never
 * transform anything inside a fence. Returns [{ line, inFence }].
 */
export function annotateFences(body) {
  let inFence = false;
  return body.split('\n').map((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      const wasOpening = !inFence;
      inFence = !inFence;
      // The fence delimiter itself is never a target for transformation.
      return { line, inFence: true, isFence: true, opening: wasOpening };
    }
    return { line, inFence, isFence: false };
  });
}

/**
 * Applies `fn` only to the parts of a line that are outside inline code spans,
 * so `` `<script>` `` and `RM-XXXX-XXXX` are left untouched.
 */
export function mapOutsideInlineCode(line, fn) {
  return line
    .split(/(`+[^`]*`+)/g)
    .map((chunk) => (chunk.startsWith('`') ? chunk : fn(chunk)))
    .join('');
}

/** Heading slugs for a body, matching what rehype-slug will emit. */
export function headingSlugs(body) {
  const slugger = new GithubSlugger();
  const out = [];
  for (const { line, inFence } of annotateFences(body)) {
    if (inFence) continue;
    const match = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (!match) continue;
    const text = stripInlineMarkdown(match[2]);
    out.push({ depth: match[1].length, text, id: slugger.slug(text) });
  }
  return out;
}

/** Reduce inline markdown to the plain text a reader sees. */
export function stripInlineMarkdown(input) {
  return input
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\\([{}<>])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}
