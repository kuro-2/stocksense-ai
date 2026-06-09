import { Card } from '@/components/ui/Card';
import { ShieldAlert } from 'lucide-react';

interface RiskPanelProps {
  risks: string[];
}

export function RiskPanel({ risks }: RiskPanelProps) {
  if (!risks?.length) return null;
  return (
    <Card>
      <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-red-500" />
        Key Risks
      </h3>
      <ul className="space-y-2">
        {risks.map((r, i) => (
          <li key={i} className="flex gap-2 text-sm text-slate-700">
            <span className="text-red-400 flex-shrink-0">•</span>
            {r}
          </li>
        ))}
      </ul>
    </Card>
  );
}
