'use client';
import { useEffect, useRef } from 'react';
import type { OHLCVPoint } from '@/types/stock';

interface PriceChartProps {
  data: OHLCVPoint[];
  support: number;
  resistance: number;
}

export function PriceChart({ data, support, resistance }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !data?.length) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let chart: any = null;

    async function init() {
      const lc = await import('lightweight-charts');
      const { createChart, CrosshairMode, CandlestickSeries, LineSeries } = lc;
      if (!containerRef.current) return;

      chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: 350,
        crosshair: { mode: CrosshairMode.Normal },
        layout: { background: { color: '#ffffff' }, textColor: '#334155' },
        grid: {
          vertLines: { color: '#f1f5f9' },
          horzLines: { color: '#f1f5f9' },
        },
        rightPriceScale: { borderColor: '#e2e8f0' },
        timeScale: { borderColor: '#e2e8f0', timeVisible: true },
      });

      const candlestick = chart.addSeries(CandlestickSeries, {
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderUpColor: '#22c55e',
        borderDownColor: '#ef4444',
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      });

      const chartData = data.map(d => ({
        time: d.date.slice(0, 10) as `${number}-${number}-${number}`,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

      candlestick.setData(chartData);

      const supportLine = chart.addSeries(LineSeries, { color: '#22c55e', lineWidth: 1, lineStyle: 2 });
      supportLine.setData(chartData.map((d: { time: string }) => ({ time: d.time, value: support })));

      const resistanceLine = chart.addSeries(LineSeries, { color: '#ef4444', lineWidth: 1, lineStyle: 2 });
      resistanceLine.setData(chartData.map((d: { time: string }) => ({ time: d.time, value: resistance })));

      chart.timeScale().fitContent();
    }

    init();
    return () => { chart?.remove(); };
  }, [data, support, resistance]);

  return <div ref={containerRef} className="w-full rounded-lg overflow-hidden" style={{ height: 350 }} />;
}
