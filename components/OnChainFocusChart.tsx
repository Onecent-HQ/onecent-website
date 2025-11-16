"use client";

import React, { useEffect, useId, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface OnChainFocusChartProps {
  investorId: string;
}

type SegmentKey = "verified" | "unverified" | "angel";

const SEGMENT_META: Record<SegmentKey, { label: string; color: string; gradientColors: string[] }> = {
  verified: { 
    label: "Verified", 
    color: "#FFFFFF", 
    gradientColors: ["#FFFFFF", "#E5E5E5", "#CCCCCC"] 
  },
  unverified: { 
    label: "Unverified", 
    color: "#B3B3B3", 
    gradientColors: ["#E5E5E5", "#B3B3B3", "#999999"] 
  },
  angel: { 
    label: "Angel", 
    color: "#808080", 
    gradientColors: ["#B3B3B3", "#808080", "#666666"] 
  },
};

export default function OnChainFocusChart({ investorId }: OnChainFocusChartProps) {
  const [investments, setInvestments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const chartInstanceId = useId();

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const response = await fetch(`/api/investments/public/${investorId}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setInvestments(data.investments || []);
      } catch (error) {
        console.error("Error fetching investments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (investorId) {
      fetchInvestments();
    }
  }, [investorId]);

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_18px_45px_rgba(0,0,0,0.2)] backdrop-blur">
        <div className="text-white/40 text-sm">Loading investment distribution...</div>
      </section>
    );
  }

  // Group investments by type and calculate counts
  const groupedInvestments = {
    verified: investments.filter((inv) => inv.type === "verified"),
    unverified: investments.filter((inv) => inv.type === "unverified"),
    angel: investments.filter((inv) => inv.type === "angel"),
  };

  // Calculate counts (not USD)
  const counts = {
    verified: groupedInvestments.verified.length,
    unverified: groupedInvestments.unverified.length,
    angel: groupedInvestments.angel.length,
  };

  // Calculate USD totals (only where available - mainly for angel investments)
  const usdTotals = {
    verified: groupedInvestments.verified.reduce((sum, inv) => sum + (inv.amountUsd || 0), 0),
    unverified: groupedInvestments.unverified.reduce((sum, inv) => sum + (inv.amountUsd || 0), 0),
    angel: groupedInvestments.angel.reduce((sum, inv) => sum + (inv.amountUsd || 0), 0),
  };

  const totalCount = counts.verified + counts.unverified + counts.angel;
  const totalUsd = usdTotals.verified + usdTotals.unverified + usdTotals.angel;

  // Prepare chart data - using counts for segment sizes
  const chartData = (Object.keys(SEGMENT_META) as SegmentKey[])
    .map((key) => ({
      name: SEGMENT_META[key].label,
      value: counts[key],
      count: counts[key],
      usd: usdTotals[key],
      color: SEGMENT_META[key].color,
      gradientColors: SEGMENT_META[key].gradientColors,
      gradientId: `${chartInstanceId}-${key}-gradient`,
    }))
    .filter((segment) => segment.value > 0); // Only show segments with investments

  // Handle empty state
  if (totalCount === 0) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_18px_45px_rgba(0,0,0,0.2)] backdrop-blur">
        <div className="text-white/60 text-sm text-center py-8">
          No investments captured yet.
        </div>
      </section>
    );
  }

  // No labels on chart - we'll use legend instead for premium look

  // Custom tooltip with premium styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalCount > 0 ? ((data.count / totalCount) * 100).toFixed(0) : 0;
      return (
        <div className="bg-black/98 border border-white/20 rounded-xl p-4 shadow-2xl backdrop-blur-sm">
          <p className="text-white font-semibold text-sm mb-2">{data.name}</p>
          <div className="space-y-1">
            <p className="text-white/90 text-sm">
              {data.count} {data.count === 1 ? "investment" : "investments"}
            </p>
            <p className="text-white/60 text-xs">
              {percentage}% of portfolio
            </p>
            {data.usd > 0 && (
              <p className="text-white/80 text-sm mt-2 pt-2 border-t border-white/10">
                ${data.usd.toLocaleString()} in {data.name.toLowerCase()} investments
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_18px_45px_rgba(0,0,0,0.2)] backdrop-blur">
      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-stretch">
        {/* Summary Section */}
        <div className="lg:w-5/12 space-y-6">
          <div>
            <p className="text-[11px] tracking-[0.16em] uppercase text-white/60">
              Overview
            </p>
            <h2 className="mt-1 text-[20px] font-semibold text-white">
              Investment Distribution
            </h2>
            <p className="mt-2 text-sm text-white/65">
              Distribution of your investments by type (verified on-chain, unverified, and angel investments).
            </p>
          </div>

          {/* Investment Counts */}
          <div className="space-y-4">
            {chartData.map((segment) => {
              const percentage = totalCount > 0 ? ((segment.count / totalCount) * 100).toFixed(0) : 0;
              return (
                <div className="flex items-center justify-between py-2" key={segment.name}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full ring-2 ring-white/20"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span className="text-xs uppercase tracking-[0.16em] text-white/60 font-medium">
                      {segment.name.toLowerCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-white block">
                      {segment.count} {segment.count === 1 ? "position" : "positions"}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-white/50">
                        {percentage}%
                      </span>
                      {segment.usd > 0 && (
                        <>
                          <span className="text-xs text-white/40">•</span>
                          <span className="text-xs text-white/60">
                            ${segment.usd.toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Total */}
            <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.16em] text-white/70 font-semibold">
                Total Portfolio
              </span>
              <div className="text-right">
                <span className="text-sm font-semibold text-white block">
                  {totalCount} {totalCount === 1 ? "investment" : "investments"}
                </span>
                {totalUsd > 0 && (
                  <span className="text-xs text-white/60 mt-0.5 block">
                    ${totalUsd.toLocaleString()} in angel investments
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Single Unified Chart - Premium Design */}
        <div className="lg:w-7/12 flex items-center justify-center">
          <div className="relative w-full max-w-lg aspect-square">
            {/* Premium glow effects */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/15 via-white/5 to-transparent blur-3xl opacity-60" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-white/10 blur-2xl opacity-40" />
            
            {/* Chart container with premium styling */}
            <div className="relative w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {chartData.map((segment) => (
                      <linearGradient
                        key={segment.gradientId}
                        id={segment.gradientId}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor={segment.gradientColors[0]} stopOpacity={1} />
                        <stop offset="50%" stopColor={segment.gradientColors[1]} stopOpacity={0.95} />
                        <stop offset="100%" stopColor={segment.gradientColors[2]} stopOpacity={0.9} />
                      </linearGradient>
                    ))}
                    {/* Premium glow filter */}
                    <filter id={`${chartInstanceId}-glow`}>
                      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius="82%"
                    innerRadius="48%"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={2}
                    cornerRadius={16}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={2}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#${entry.gradientId})`}
                        filter={`url(#${chartInstanceId}-glow)`}
                        style={{
                          filter: `drop-shadow(0 0 8px ${entry.color}40)`,
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center label with premium styling */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {totalCount}
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/50 font-medium">
                    {totalCount === 1 ? "Investment" : "Investments"}
                  </div>
                  {totalUsd > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <div className="text-sm font-semibold text-white/80">
                        ${totalUsd.toLocaleString()}
                      </div>
                      <div className="text-xs text-white/40 mt-0.5">
                        Angel investments
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
