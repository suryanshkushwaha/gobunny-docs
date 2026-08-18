import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';

import { SectionGrid } from '@/components/docs/docs-home';
import { Callout } from '@/components/mdx/callout';
import { cn } from '@/lib/utils';

/**
 * The docs type scale:
 *
 *   h1  24px  text-2xl  page title, in the shell
 *   h2  20px  text-xl   one level added for docs
 *   h3  16px  text-base card title
 *   h4  14px  text-sm
 *   body 14px text-sm   the dominant body size — same as the sidebar
 *   meta 12px text-xs
 *
 * Headings are tinted with the brand colour. In dark mode that resolves to
 * #8b85ff rather than #635bff (see globals.css) so it clears AA. They carry no
 * underline; links always do, which is what keeps the two apart.
 *
 * Running prose is capped at 68ch for measure, while tables and code blocks get
 * the full column width.
 */

const PROSE = 'max-w-[68ch]';
const headingTint = 'text-docs-accent-text';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ className, ...props }) => (
      <h1
        className={cn(
          'mt-8 mb-3 scroll-m-20 text-2xl font-semibold tracking-tight text-balance',
          headingTint,
          className,
        )}
        {...props}
      />
    ),

    // Deliberately no rule above h2. Pages already carry up to six bordered
    // tables and six callouts; another horizontal line per section turns the
    // page into a stack of boxes. Space, size and tint carry the hierarchy.
    h2: ({ className, ...props }) => (
      <h2
        className={cn(
          'mt-10 mb-3 scroll-m-20 text-xl font-semibold tracking-tight text-balance',
          headingTint,
          className,
        )}
        {...props}
      />
    ),
    h3: ({ className, ...props }) => (
      <h3
        className={cn(
          'mt-7 mb-2 scroll-m-20 text-base font-semibold text-balance',
          headingTint,
          className,
        )}
        {...props}
      />
    ),
    h4: ({ className, ...props }) => (
      <h4
        className={cn(
          'mt-6 mb-2 scroll-m-20 text-sm font-semibold',
          headingTint,
          className,
        )}
        {...props}
      />
    ),

    p: ({ className, ...props }) => (
      <p className={cn('my-4 text-sm leading-6', PROSE, className)} {...props} />
    ),

    ul: ({ className, ...props }) => (
      <ul
        className={cn(
          'my-4 space-y-2 text-sm leading-6',
          // A tinted marker instead of the default bullet, matched to the
          // heading colour so lists read as part of the same system. The 0.625rem
          // offset centres a 4px dot on a 24px first line.
          '[&>li]:relative [&>li]:pl-5 [&>li]:before:absolute [&>li]:before:top-[0.625rem] [&>li]:before:left-1 [&>li]:before:size-1 [&>li]:before:rounded-full [&>li]:before:bg-docs-accent-text/50 [&>li]:before:content-[""]',
          PROSE,
          className,
        )}
        {...props}
      />
    ),
    ol: ({ className, ...props }) => (
      <ol
        className={cn(
          'my-4 list-decimal space-y-2 pl-5 text-sm leading-6 marker:text-xs marker:font-medium marker:text-muted-foreground',
          PROSE,
          className,
        )}
        {...props}
      />
    ),
    li: ({ className, ...props }) => (
      <li className={cn('[&>ul]:my-2 [&>ol]:my-2', className)} {...props} />
    ),

    a: ({ className, href = '', ...props }) => {
      const classes = cn(
        'font-medium text-docs-accent-text underline decoration-current/30 underline-offset-[3px] transition-[text-decoration-color] hover:decoration-current',
        className,
      );
      const isInternal = href.startsWith('/') || href.startsWith('#');

      if (!isInternal) {
        return (
          <a
            className={classes}
            href={href}
            target='_blank'
            rel='noreferrer noopener'
            {...props}
          />
        );
      }
      return <Link className={classes} href={href} {...props} />;
    },

    strong: ({ className, ...props }) => (
      <strong
        className={cn('font-semibold text-foreground', className)}
        {...props}
      />
    ),

    blockquote: ({ className, ...props }) => (
      <blockquote
        className={cn(
          'my-5 border-l-2 border-border pl-4 text-sm leading-6 text-muted-foreground',
          PROSE,
          className,
        )}
        {...props}
      />
    ),

    hr: ({ className, ...props }) => (
      <hr className={cn('my-8 border-border', className)} {...props} />
    ),

    // Tables are the guide's densest element — 6 on a single page — so they get
    // a card-like container, an uppercase meta header, and a row hover. Each
    // one scrolls inside itself rather than pushing the page sideways.
    table: ({ className, ...props }) => (
      <div className='my-5 w-full overflow-x-auto rounded-lg border border-border bg-card'>
        <table
          className={cn(
            'w-full border-collapse text-left text-sm [&_a]:font-medium',
            className,
          )}
          {...props}
        />
      </div>
    ),
    thead: ({ className, ...props }) => (
      <thead
        className={cn('border-b border-border bg-muted/40', className)}
        {...props}
      />
    ),
    tbody: ({ className, ...props }) => (
      <tbody className={cn('divide-y divide-border', className)} {...props} />
    ),
    tr: ({ className, ...props }) => (
      <tr
        className={cn('transition-colors hover:bg-muted/40', className)}
        {...props}
      />
    ),
    th: ({ className, ...props }) => (
      <th
        className={cn(
          'px-3 py-2 align-top text-[11px] font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase',
          className,
        )}
        {...props}
      />
    ),
    td: ({ className, ...props }) => (
      <td
        className={cn(
          'px-3 py-2.5 align-top leading-6 [&>strong]:font-medium',
          className,
        )}
        {...props}
      />
    ),

    // rehype-pretty-code wraps each block in this figure. It is a pass-through:
    // the chrome lives on `pre` so the language label can sit outside the
    // scrolling region.
    figure: ({ className, ...props }) => (
      <figure className={className} {...props} />
    ),

    pre: ({ className, children, ...props }) => {
      const language = (props as Record<string, unknown>)['data-language'] as
        | string
        | undefined;
      const showLanguage = language && language !== 'plaintext';

      return (
        <div className='my-5 overflow-hidden rounded-lg border border-border bg-muted'>
          {showLanguage ? (
            <div className='border-b border-border px-3 py-1.5'>
              <span className='font-mono text-[11px] tracking-wide text-muted-foreground uppercase'>
                {language}
              </span>
            </div>
          ) : null}
          <pre
            className={cn(
              'overflow-x-auto px-4 py-3 font-mono text-[13px] leading-6',
              className,
            )}
            {...props}
          >
            {children}
          </pre>
        </div>
      );
    },

    code: ({ className, ...props }) => {
      // rehype-pretty-code tags block code with data-language; anything without
      // it is an inline span and gets the chip treatment.
      const isHighlightedBlock = 'data-language' in props;
      if (isHighlightedBlock) return <code className={className} {...props} />;
      return (
        <code
          className={cn(
            'rounded-[min(var(--radius-sm),6px)] border border-border bg-muted px-1 py-0.5 font-mono text-[0.8125rem] text-foreground',
            className,
          )}
          {...props}
        />
      );
    },

    Callout,
    // Used once, on the landing page, so the section grid can sit exactly where
    // it reads best in the content.
    SectionGrid,
    ...components,
  };
}
