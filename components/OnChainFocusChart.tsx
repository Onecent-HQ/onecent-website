"use client";

import { useId } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface OnChainFocusChartProps {
  onChainFocusPct: number;
  variant?: "default" | "compact" | "premium";
}

const VARIANT_CONFIG = {
  default: {
    height: 192,
    innerRadius: 42,
    outerRadius: 80,
    showCaption: true,
    centerBadge: false,
  },
  compact: {
    height: 120,
    innerRadius: 30,
    outerRadius: 52,
    showCaption: false,
    centerBadge: false,
  },
  premium: {
    height: 200,
    innerRadius: 65,
    outerRadius: 90,
    showCaption: false,
    centerBadge: true,
  },
};

export default function OnChainFocusChart({ onChainFocusPct, variant = "default" }: OnChainFocusChartProps) {
  const chartId = useId();
  const sanitizedPct = Math.max(0, Math.min(100, Number.isFinite(onChainFocusPct) ? onChainFocusPct : 0));

  const chartData = [
    { name: "On-chain", value: sanitizedPct },
    { name: "Off-chain", value: Math.max(0, 100 - sanitizedPct) },
  ];

  const config = VARIANT_CONFIG[variant];

  return (
    <div className="flex w-full h-full flex-col items-center justify-center gap-2">
      <div className="relative w-full h-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <linearGradient id={`${chartId}-primary`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0A66C2" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.85} />
              </linearGradient>
            </defs>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={config.innerRadius}
              outerRadius={config.outerRadius}
              cornerRadius={14}
              stroke="#F1F5F9"
              strokeWidth={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              <Cell fill={`url(#${chartId}-primary)`} />
              <Cell fill="rgba(148, 163, 184, 0.18)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {config.centerBadge ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-[14px] font-semibold text-slate-900 shadow-[0_10px_24px_rgba(148,163,184,0.3)]">
              {Math.round(sanitizedPct)}%
            </div>
          </div>
        ) : null}
      </div>

      {config.showCaption ? (
        <p className="text-center text-sm text-gray-600">{Math.round(sanitizedPct)}% on-chain focus</p>
      ) : null}
    </div>
  );
}

