import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import type { ReactNode } from 'react';

export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <section className="bg-(--ink) text-white">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{title}</h1>
          <p className="text-slate-400 text-sm">Last updated: {updated}</p>
        </div>
      </section>
      <article className="max-w-3xl mx-auto px-4 py-12 prose-legal">
        {children}
      </article>
      <Footer />
    </div>
  );
}
