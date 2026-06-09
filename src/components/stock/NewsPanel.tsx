import { Card } from '@/components/ui/Card';
import { Newspaper } from 'lucide-react';

interface NewsPanelProps {
  highlights: string[];
}

export function NewsPanel({ highlights }: NewsPanelProps) {
  if (!highlights?.length) return null;
  return (
    <Card>
      <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <Newspaper className="w-4 h-4" />
        News Highlights
      </h3>
      <ul className="space-y-2">
        {highlights.map((h, i) => (
          <li key={i} className="flex gap-3 text-sm text-slate-700 border-l-2 border-blue-400 pl-3 py-1">
            {h}
          </li>
        ))}
      </ul>
    </Card>
  );
}
