'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Delay in seconds before the reveal transition starts once visible. */
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
}

/**
 * Fades + translates content up into view the first time it enters the
 * viewport. Mirrors the `.reveal` / `.reveal.in` classes in globals.css.
 */
export function Reveal({ children, className, delay = 0, as: Tag = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Component = Tag as React.ElementType;

  return (
    <Component
      ref={ref}
      className={cn('reveal', visible && 'in', className)}
      style={delay ? ({ '--rd': `${delay}s` } as React.CSSProperties) : undefined}
    >
      {children}
    </Component>
  );
}
