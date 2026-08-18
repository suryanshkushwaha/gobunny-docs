'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Search } from 'lucide-react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { basePath } from '@/lib/base-path';
import { NavIcon } from '@/lib/docs/nav-icons';
import { search, type SearchResult } from '@/lib/docs/search';
import type { SearchIndex } from '@/lib/docs/types';

const subscribeToPlatform = () => () => {};
const getIsApplePlatform = () =>
  /Macintosh|iPhone|iPad|iPod/.test(navigator.userAgent);
const getServerIsApplePlatform = () => false;

export type QuickLink = { href: string; label: string; hint: string };

/**
 * The trigger button: magnifier left, Ctrl/⌘ K badge right.
 *
 * The index is a static JSON file built at compile time and fetched on first
 * open — no Algolia, no external request, nothing loaded until it is needed.
 */
export function DocsSearch({ quickLinks }: { quickLinks: QuickLink[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [index, setIndex] = React.useState<SearchIndex | null>(null);
  const [loadFailed, setLoadFailed] = React.useState(false);

  const isApplePlatform = React.useSyncExternalStore(
    subscribeToPlatform,
    getIsApplePlatform,
    getServerIsApplePlatform,
  );

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Fetched lazily, once, the first time the dialog is opened.
  React.useEffect(() => {
    if (!open || index || loadFailed) return;
    let cancelled = false;

    fetch(`${basePath}/search-index.json`)
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<SearchIndex>;
      })
      .then((data) => {
        if (!cancelled) setIndex(data);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [open, index, loadFailed]);

  const results = React.useMemo(
    () => search(index, query),
    [index, query],
  );

  const go = (href: string) => {
    setOpen(false);
    setQuery('');
    router.push(href);
  };

  return (
    <>
      <button
        type='button'
        aria-label='Search the docs'
        onClick={() => setOpen(true)}
        className='relative flex size-8 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-muted/40 text-xs text-muted-foreground transition-colors after:absolute after:-inset-y-1.5 hover:bg-muted sm:w-60 sm:justify-start sm:px-3 md:after:inset-y-0'
      >
        <Search className='size-3.5 text-muted-foreground' />
        <span className='hidden sm:inline'>Search the docs...</span>
        <kbd className='pointer-events-none ml-auto hidden h-5 items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 select-none sm:inline-flex'>
          <span>{isApplePlatform ? '⌘' : 'Ctrl'}</span>
          <span>K</span>
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title='Search the docs'
        description='Find any page or section of the GoBunny user guide.'
        commandProps={{ shouldFilter: false }}
      >
        <CommandInput
          placeholder='Search the docs...'
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {query.trim() ? (
            <>
              <CommandEmpty>
                {loadFailed
                  ? 'Search is unavailable right now.'
                  : index
                    ? 'No results found.'
                    : 'Loading…'}
              </CommandEmpty>
              {results.length > 0 && (
                <CommandGroup heading={`${results.length} result${results.length === 1 ? '' : 's'}`}>
                  {results.map((result) => (
                    <ResultItem key={result.href} result={result} onSelect={go} />
                  ))}
                </CommandGroup>
              )}
            </>
          ) : (
            <CommandGroup heading='Jump to'>
              {quickLinks.map((link) => (
                <CommandItem
                  key={link.href}
                  value={link.href}
                  onSelect={() => go(link.href)}
                >
                  <NavIcon route={link.href} className='mr-2 size-4' />
                  <span>{link.label}</span>
                  <span className='ml-auto text-xs text-muted-foreground'>
                    {link.hint}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

function ResultItem({
  result,
  onSelect,
}: {
  result: SearchResult;
  onSelect: (href: string) => void;
}) {
  return (
    <CommandItem
      value={result.href}
      onSelect={() => onSelect(result.href)}
      className='items-start py-2'
    >
      <NavIcon
        route={result.route}
        className='mt-0.5 mr-2 size-4 shrink-0 text-muted-foreground'
      />
      <div className='flex min-w-0 flex-col gap-0.5'>
        <div className='flex items-center gap-1.5'>
          <span className='truncate font-medium'>{result.title}</span>
          {result.heading ? (
            <>
              <span className='text-muted-foreground'>›</span>
              <span className='truncate text-muted-foreground'>
                {result.heading}
              </span>
            </>
          ) : null}
        </div>
        {result.snippet ? (
          <span className='line-clamp-2 text-xs text-muted-foreground'>
            {result.snippet}
          </span>
        ) : null}
      </div>
      <span className='ml-auto hidden shrink-0 items-center gap-1 pl-2 text-xs text-muted-foreground sm:flex'>
        <FileText className='size-3' />
        {result.section}
      </span>
    </CommandItem>
  );
}
