'use client';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINR } from '@/lib/utils';

interface SectorAllocationChartProps {
  sectorAllocation: Record<string, number>;
}

const COLORS = ['#19b98a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#64748b'];

export function SectorAllocationChart({ sectorAllocation }: SectorAllocationChartProps) {
  const data = Object.entries(sectorAllocation)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return <p className="text-sm text-(--muted) text-center py-8">No positions yet</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatINR(Number(value ?? 0))} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
