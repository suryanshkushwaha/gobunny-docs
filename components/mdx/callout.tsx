import { AlertTriangle, CircleAlert, Info, Lightbulb } from 'lucide-react';

import { cn } from '@/lib/utils';

const variants = {
  note: {
    icon: Info,
    box: 'border-border bg-muted/40 before:bg-primary',
    chip: 'bg-primary/10 text-primary',
  },
  tip: {
    icon: Lightbulb,
    box: 'border-success/20 bg-success/5 before:bg-success',
    chip: 'bg-success/10 text-success',
  },
  warning: {
    icon: AlertTriangle,
    box: 'border-warning/25 bg-warning/5 before:bg-warning',
    chip: 'bg-warning/10 text-warning',
  },
  danger: {
    icon: CircleAlert,
    box: 'border-destructive/25 bg-destructive/5 before:bg-destructive',
    chip: 'bg-destructive/10 text-destructive',
  },
} as const;

export type CalloutVariant = keyof typeof variants;

/**
 * The callout used throughout the guide. All 49 blocks are the default `note`;
 * the other variants are here so future notes have somewhere to go.
 *
 * A 2px accent rule down the leading edge does the work of separating it from
 * body copy, so the fill can stay very light and the block never shouts — there
 * are up to six of these on a single page.
 */
export function Callout({
  variant = 'note',
  title,
  children,
  className,
}: {
  variant?: CalloutVariant;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const { icon: Icon, box, chip } = variants[variant] ?? variants.note;

  return (
    <div
      className={cn(
        'relative my-5 max-w-[68ch] overflow-hidden rounded-lg border py-3 pr-4 pl-4 text-sm leading-6',
        'before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:content-[""]',
        box,
        className,
      )}
    >
      <div className='flex gap-2.5'>
        <span
          aria-hidden='true'
          className={cn(
            'mt-px flex size-5 shrink-0 items-center justify-center rounded-md',
            chip,
          )}
        >
          <Icon className='size-3.5' />
        </span>
        <div className='min-w-0 flex-1'>
          {title ? (
            <p className='mb-1 text-xs font-medium tracking-wide text-foreground uppercase'>
              {title}
            </p>
          ) : null}
          {/* Margins collapse here; the box supplies the spacing. */}
          <div className='[&>*+*]:mt-2 [&>*]:my-0 [&>p]:max-w-none'>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
