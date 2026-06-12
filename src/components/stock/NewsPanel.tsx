import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Newspaper } from 'lucide-react';

interface NewsPanelProps {
  highlights: string[];
  source?: 'live' | 'ai';
}

export function NewsPanel({ highlights, source }: NewsPanelProps) {
  if (!highlights?.length) return null;
  return (
    <Card>
      <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <Newspaper className="w-4 h-4" />
        News Highlights
        {source === 'live' ? (
          <Badge variant="success">Live</Badge>
        ) : (
          <Badge variant="neutral">AI knowledge</Badge>
        )}
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
