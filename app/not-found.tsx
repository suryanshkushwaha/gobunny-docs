import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { SidebarInset } from '@/components/ui/sidebar';

export const metadata: Metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return (
    // SidebarInset because the sidebar is rendered by the root layout, so a 404
    // still sits inside the normal frame rather than beside it.
    <SidebarInset className='min-w-0'>
      <div className='flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center'>
        <p className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>
          404
        </p>
        <h1 className='text-2xl font-semibold tracking-tight'>Page not found</h1>
        <p className='max-w-[48ch] text-sm leading-6 text-muted-foreground'>
          That page is not part of the guide. It may have moved, or the link may
          be mistyped.
        </p>
        <Button nativeButton={false} render={<Link href='/' />} className='mt-2'>
          Back to the guide
        </Button>
      </div>
    </SidebarInset>
  );
}
