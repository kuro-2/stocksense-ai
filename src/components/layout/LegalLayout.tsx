import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import type { ReactNode } from 'react';

export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section style={{ background: 'var(--ink)', color: 'var(--foreground)' }}>
        <div className="wrap" style={{ paddingBlock: 'var(--s8)' }}>
          <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.4)' }}>Legal</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(32px,5vw,52px)', letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: 'var(--s3)', color: 'var(--foreground)' }}>
            {title}
          </h1>
          <p style={{ marginTop: 'var(--s3)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
            Last updated: {updated}
          </p>
        </div>
      </section>
      <article className="wrap prose-legal" style={{ paddingBlock: 'var(--s8)' }}>
        {children}
      </article>
      <Footer />
    </div>
  );
}
