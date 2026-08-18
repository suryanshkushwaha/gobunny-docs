import type { SearchChunk, SearchIndex, SearchPage } from './types';

export type SearchResult = {
  route: string;
  href: string;
  title: string;
  section: string;
  heading: string;
  snippet: string;
  score: number;
};

const SNIPPET_RADIUS = 70;

type Term = { raw: string; squashed: string };

/**
 * Punctuation-free form of a string. The guide writes "Wi-Fi" 32 times, and a
 * front-desk user searching "wifi" has to find it — comparing squashed forms
 * makes those equivalent, and does the same for "QR code" / "qrcode".
 */
function squash(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

/** Split on whitespace only, so a hyphenated term stays one term. */
function toTerms(query: string): Term[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((raw) => ({ raw: raw.trim(), squashed: squash(raw) }))
    .filter((term) => term.squashed.length > 1);
}

type PreparedChunk = SearchChunk & {
  headingLower: string;
  headingSquashed: string;
  bodyLower: string;
  bodySquashed: string;
};

type PreparedPage = {
  page: SearchPage;
  titleLower: string;
  titleSquashed: string;
  sectionLower: string;
  descriptionLower: string;
  descriptionSquashed: string;
  chunks: PreparedChunk[];
};

// Squashing the whole corpus is not free, so it happens once per loaded index
// rather than on every keystroke.
const preparedCache = new WeakMap<SearchIndex, PreparedPage[]>();

function prepare(index: SearchIndex): PreparedPage[] {
  const cached = preparedCache.get(index);
  if (cached) return cached;

  const prepared = index.pages.map((page) => ({
    page,
    titleLower: page.t.toLowerCase(),
    titleSquashed: squash(page.t),
    sectionLower: page.s.toLowerCase(),
    descriptionLower: page.d.toLowerCase(),
    descriptionSquashed: squash(page.d),
    chunks: page.c.map((chunk) => ({
      ...chunk,
      headingLower: chunk.h.toLowerCase(),
      headingSquashed: squash(chunk.h),
      bodyLower: chunk.x.toLowerCase(),
      bodySquashed: squash(chunk.x),
    })),
  }));

  preparedCache.set(index, prepared);
  return prepared;
}

function hits(lower: string, squashed: string, term: Term): number {
  if (!lower) return 0;

  let count = 0;
  let index = lower.indexOf(term.raw);
  while (index !== -1 && count < 5) {
    count++;
    index = lower.indexOf(term.raw, index + term.raw.length);
  }
  if (count) return count;

  // Fall back to the punctuation-free comparison.
  return squashed.includes(term.squashed) ? 1 : 0;
}

/** ~140 characters of body text centred on the first hit. */
function snippetAround(text: string, term: Term): string {
  const lower = text.toLowerCase();
  const index =
    lower.indexOf(term.raw) !== -1
      ? lower.indexOf(term.raw)
      : lower.indexOf(term.squashed.slice(0, 4));

  if (index === -1) return text.slice(0, SNIPPET_RADIUS * 2).trim();

  const start = Math.max(0, index - SNIPPET_RADIUS);
  const end = Math.min(text.length, index + term.raw.length + SNIPPET_RADIUS);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${
    end < text.length ? '…' : ''
  }`;
}

function scorePage(entry: PreparedPage, terms: Term[]): SearchResult | null {
  const { page } = entry;

  let total = 0;
  let titleMatchesEveryTerm = true;
  // Annotated rather than inferred: it is only assigned inside a closure, which
  // TypeScript would otherwise narrow to `never`.
  let bestChunk: { score: number; index: number } | undefined;

  for (const term of terms) {
    let termScore = 0;

    // Title matches dominate — a page called "Rooms" should win "rooms".
    const titleHit = hits(entry.titleLower, entry.titleSquashed, term);
    if (titleHit) {
      termScore += 12;
      if (entry.titleLower.startsWith(term.raw)) termScore += 6;
      if (entry.titleSquashed === term.squashed) termScore += 10;
    } else {
      titleMatchesEveryTerm = false;
    }

    if (entry.sectionLower.includes(term.raw)) termScore += 3;
    if (hits(entry.descriptionLower, entry.descriptionSquashed, term)) {
      termScore += 4;
    }

    entry.chunks.forEach((chunk, index) => {
      let chunkScore = 0;
      if (hits(chunk.headingLower, chunk.headingSquashed, term)) chunkScore += 8;
      chunkScore += hits(chunk.bodyLower, chunk.bodySquashed, term) * 2;
      if (!chunkScore) return;

      termScore += chunkScore;
      if (!bestChunk || chunkScore > bestChunk.score) {
        bestChunk = { score: chunkScore, index };
      }
    });

    // Every term has to land somewhere on the page.
    if (termScore === 0) return null;
    total += termScore;
  }

  const chunk = bestChunk ? entry.chunks[bestChunk.index] : undefined;

  // Searching a page by its own name should land at the top of that page, not
  // part-way down whichever section repeats the word most.
  const href =
    titleMatchesEveryTerm || !chunk?.i ? page.r : `${page.r}#${chunk.i}`;

  return {
    route: page.r,
    href,
    title: page.t,
    section: page.s,
    heading: titleMatchesEveryTerm ? '' : (chunk?.h ?? ''),
    snippet: chunk?.x ? snippetAround(chunk.x, terms[0]) : page.d,
    score: total + (titleMatchesEveryTerm ? 25 : 0),
  };
}

export function search(
  index: SearchIndex | null,
  query: string,
  limit = 8,
): SearchResult[] {
  if (!index) return [];
  const terms = toTerms(query);
  if (!terms.length) return [];

  return prepare(index)
    .map((entry) => scorePage(entry, terms))
    .filter((result): result is SearchResult => result !== null)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}
