'use client';

import * as React from 'react';
import { MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ThemeSwitcherProps {
  className?: string;
  fixed?: boolean;
}

export function ThemeSwitcher({ className, fixed = true }: ThemeSwitcherProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <Button
      type='button'
      variant='outline'
      size='icon'
      className={cn(
        fixed
          ? 'fixed top-4 right-4 z-50 shadow-xs md:top-6 md:right-6'
          : 'shadow-xs',
        className,
      )}
      aria-label={
        mounted ? `Switch to ${isDark ? 'light' : 'dark'} mode` : 'Toggle theme'
      }
      aria-pressed={mounted ? isDark : undefined}
      title={
        mounted ? `Switch to ${isDark ? 'light' : 'dark'} mode` : 'Toggle theme'
      }
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? (
        <SunMedium aria-hidden='true' />
      ) : (
        <MoonStar aria-hidden='true' />
      )}
    </Button>
  );
}
