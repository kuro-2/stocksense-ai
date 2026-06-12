import { Card } from '@/components/ui/Card';
import { formatINR } from '@/lib/utils';
import type { OptionChainResult } from '@/lib/nse';

interface OptionChainTableProps {
  data: OptionChainResult;
}

export function OptionChainTable({ data }: OptionChainTableProps) {
  const maxOi = Math.max(
    ...data.strikes.map(s => Math.max(s.ce?.oi ?? 0, s.pe?.oi ?? 0)),
    1
  );

  // Highlight the strike closest to the current underlying price (ATM)
  const atmStrike = data.strikes.reduce((closest, s) => {
    return Math.abs(s.strikePrice - data.underlyingValue) < Math.abs(closest - data.underlyingValue)
      ? s.strikePrice
      : closest;
  }, data.strikes[0]?.strikePrice ?? 0);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="font-semibold text-slate-900">Option Chain — {data.symbol}</h3>
        <span className="text-xs text-slate-400">Expiry: {data.expiryDate}</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Underlying</p>
          <p className="font-semibold text-slate-900 font-mono">{formatINR(data.underlyingValue)}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">PCR</p>
          <p className={`font-semibold font-mono ${data.pcr >= 1 ? 'text-green-600' : 'text-red-600'}`}>{data.pcr}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Max Pain</p>
          <p className="font-semibold text-slate-900 font-mono">{data.maxPain}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-right px-2 py-2 font-medium text-slate-500">CE OI</th>
              <th className="text-right px-2 py-2 font-medium text-slate-500">CE Chg</th>
              <th className="text-right px-2 py-2 font-medium text-slate-500">CE IV</th>
              <th className="text-right px-2 py-2 font-medium text-slate-500">CE LTP</th>
              <th className="text-center px-2 py-2 font-medium text-slate-700 bg-slate-100">Strike</th>
              <th className="text-left px-2 py-2 font-medium text-slate-500">PE LTP</th>
              <th className="text-left px-2 py-2 font-medium text-slate-500">PE IV</th>
              <th className="text-left px-2 py-2 font-medium text-slate-500">PE Chg</th>
              <th className="text-left px-2 py-2 font-medium text-slate-500">PE OI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.strikes.map(s => {
              const isAtm = s.strikePrice === atmStrike;
              return (
                <tr key={s.strikePrice} className={isAtm ? 'bg-blue-50' : ''}>
                  <td className="px-2 py-1.5 text-right relative">
                    <div
                      className="absolute inset-y-0 right-0 bg-red-100"
                      style={{ width: `${((s.ce?.oi ?? 0) / maxOi) * 100}%` }}
                    />
                    <span className="relative font-mono">{s.ce?.oi?.toLocaleString('en-IN') ?? '—'}</span>
                  </td>
                  <td className={`px-2 py-1.5 text-right font-mono ${(s.ce?.changeOi ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {s.ce ? s.ce.changeOi.toLocaleString('en-IN') : '—'}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono text-slate-600">{s.ce?.iv?.toFixed(1) ?? '—'}</td>
                  <td className="px-2 py-1.5 text-right font-mono text-slate-900">{s.ce ? formatINR(s.ce.ltp) : '—'}</td>
                  <td className="px-2 py-1.5 text-center font-semibold bg-slate-50">{s.strikePrice}</td>
                  <td className="px-2 py-1.5 text-left font-mono text-slate-900">{s.pe ? formatINR(s.pe.ltp) : '—'}</td>
                  <td className="px-2 py-1.5 text-left font-mono text-slate-600">{s.pe?.iv?.toFixed(1) ?? '—'}</td>
                  <td className={`px-2 py-1.5 text-left font-mono ${(s.pe?.changeOi ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {s.pe ? s.pe.changeOi.toLocaleString('en-IN') : '—'}
                  </td>
                  <td className="px-2 py-1.5 text-left relative">
                    <div
                      className="absolute inset-y-0 left-0 bg-green-100"
                      style={{ width: `${((s.pe?.oi ?? 0) / maxOi) * 100}%` }}
                    />
                    <span className="relative font-mono">{s.pe?.oi?.toLocaleString('en-IN') ?? '—'}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
