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
        {/* Glow effect behind chart */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500/20 via-transparent to-orange-600/10 blur-2xl" />
        
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {/* On-chain gradient - orange theme */}
              <linearGradient id={`${chartId}-onchain`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F97316" stopOpacity={0.9} />
                <stop offset="50%" stopColor="#FB923C" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#FDBA74" stopOpacity={0.8} />
              </linearGradient>
              
              {/* Off-chain gradient - subtle dark */}
              <linearGradient id={`${chartId}-offchain`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.08)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0.03)" />
              </linearGradient>
              
              {/* Glow filter for on-chain segment */}
              <filter id={`${chartId}-glow`}>
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={config.innerRadius}
              outerRadius={config.outerRadius}
              cornerRadius={16}
              stroke="transparent"
              strokeWidth={0}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              <Cell 
                fill={`url(#${chartId}-onchain)`} 
                filter={sanitizedPct > 0 ? `url(#${chartId}-glow)` : undefined}
              />
              <Cell fill={`url(#${chartId}-offchain)`} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {config.centerBadge ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Badge glow */}
              <div className="absolute inset-0 rounded-full bg-orange-500/30 blur-xl" />
              {/* Badge */}
              <div className="relative rounded-full border border-orange-500/40 bg-gradient-to-br from-orange-500/20 via-orange-500/15 to-transparent backdrop-blur-sm px-5 py-2.5 text-[16px] font-bold text-orange-400 shadow-[0_8px_32px_rgba(249,115,22,0.3)]">
                {Math.round(sanitizedPct)}%
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {config.showCaption ? (
        <p className="text-center text-sm text-white/70">{Math.round(sanitizedPct)}% on-chain focus</p>
      ) : null}
    </div>
  );
}

