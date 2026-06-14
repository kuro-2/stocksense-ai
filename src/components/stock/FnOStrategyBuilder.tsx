'use client';
import { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { formatINR } from '@/lib/utils';
import {
  STRATEGY_TEMPLATES, computePayoff, findPremium, generatePriceRange, getStrikeStep,
  type Leg,
} from '@/lib/strategies';
import type { OptionChainResult } from '@/lib/nse';

interface FnOStrategyBuilderProps {
  symbol: string;
  spot: number;
  optionChain: OptionChainResult | null;
}

const LOT_SIZE = 1;

export function FnOStrategyBuilder({ symbol, spot, optionChain }: FnOStrategyBuilderProps) {
  const strikeStep = getStrikeStep(spot);

  function withLivePremiums(rawLegs: Leg[]): Leg[] {
    if (!optionChain) return rawLegs;
    return rawLegs.map(leg => ({ ...leg, premium: findPremium(optionChain.strikes, leg.strike, leg.type) }));
  }

  const [strategyKey, setStrategyKey] = useState('LONG_CALL');
  const [legs, setLegs] = useState<Leg[]>(() => withLivePremiums(STRATEGY_TEMPLATES['LONG_CALL'].build(spot, strikeStep)));

  function handleStrategyChange(key: string) {
    setStrategyKey(key);
    setLegs(withLivePremiums(STRATEGY_TEMPLATES[key].build(spot, strikeStep)));
  }

  function updateLeg(index: number, field: keyof Leg, value: number) {
    setLegs(prev => prev.map((leg, i) => {
      if (i !== index) return leg;
      const updated = { ...leg, [field]: value };
      // Re-fetch the live premium when the strike changes, so it still reflects real market pricing.
      if (field === 'strike' && optionChain) {
        updated.premium = findPremium(optionChain.strikes, value, leg.type);
      }
      return updated;
    }));
  }

  const priceRange = useMemo(() => generatePriceRange(spot, strikeStep, 15), [spot, strikeStep]);
  const payoff = useMemo(() => computePayoff(legs, priceRange, LOT_SIZE), [legs, priceRange]);

  const template = STRATEGY_TEMPLATES[strategyKey];

  return (
    <Card>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h3 className="font-semibold text-slate-900">F&O Strategy Builder — {symbol}</h3>
        {optionChain ? (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Live NSE premiums · expiry {optionChain.expiryDate}
          </span>
        ) : (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Live option chain unavailable
          </span>
        )}
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Spot price: {formatINR(spot)}.{' '}
        {optionChain
          ? 'Premiums below are pulled from the nearest-expiry NSE option chain (nearest available strike). Edit strike/qty to model your own trade.'
          : 'Live premiums could not be loaded — premiums default to 0. Enter the real premium from your broker for an accurate payoff.'}
      </p>

      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-500 mb-1">Strategy</label>
        <select
          value={strategyKey}
          onChange={e => handleStrategyChange(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-full max-w-sm focus:outline-none focus:border-blue-400"
        >
          {Object.entries(STRATEGY_TEMPLATES).map(([key, t]) => (
            <option key={key} value={key}>{t.name}</option>
          ))}
        </select>
        <p className="text-sm text-slate-600 mt-2">{template.description}</p>
      </div>

      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-slate-500">Type</th>
              <th className="text-left px-3 py-2 font-medium text-slate-500">Position</th>
              <th className="text-left px-3 py-2 font-medium text-slate-500">Strike</th>
              <th className="text-left px-3 py-2 font-medium text-slate-500">Premium</th>
              <th className="text-left px-3 py-2 font-medium text-slate-500">Qty (lots)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {legs.map((leg, i) => (
              <tr key={i}>
                <td className="px-3 py-2 font-medium text-slate-900">{leg.type}</td>
                <td className="px-3 py-2">
                  <span className={leg.position === 'BUY' ? 'text-green-600' : 'text-red-600'}>{leg.position}</span>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number" value={leg.strike} step={strikeStep}
                    onChange={e => updateLeg(i, 'strike', Number(e.target.value))}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-sm w-24 focus:outline-none focus:border-blue-400"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number" value={leg.premium} min={0} step={0.05}
                    onChange={e => updateLeg(i, 'premium', Number(e.target.value))}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-sm w-24 focus:outline-none focus:border-blue-400"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number" value={leg.qty} min={1} step={1}
                    onChange={e => updateLeg(i, 'qty', Number(e.target.value))}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-sm w-20 focus:outline-none focus:border-blue-400"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Max Profit</p>
          <p className="font-semibold text-green-700 font-mono">
            {payoff.maxProfit === Infinity || payoff.maxProfit > 1e9 ? 'Unlimited' : formatINR(payoff.maxProfit)}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Max Loss</p>
          <p className="font-semibold text-red-700 font-mono">
            {payoff.maxLoss === -Infinity || payoff.maxLoss < -1e9 ? 'Unlimited' : formatINR(payoff.maxLoss)}
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Breakeven(s)</p>
          <p className="font-semibold text-slate-900 font-mono">
            {payoff.breakevens.length > 0 ? payoff.breakevens.map(b => formatINR(b)).join(', ') : '—'}
          </p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={payoff.points}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="price" tickFormatter={v => `${v}`} fontSize={12} />
            <YAxis tickFormatter={v => `${v}`} fontSize={12} />
            <Tooltip
              formatter={(value) => formatINR(Number(value))}
              labelFormatter={(label) => `Price: ${formatINR(Number(label))}`}
            />
            <ReferenceLine y={0} stroke="#94a3b8" />
            <ReferenceLine x={spot} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: 'Spot', fontSize: 11, fill: '#3b82f6' }} />
            <Area type="monotone" dataKey="pnl" stroke="#10b981" fill="#10b98133" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
