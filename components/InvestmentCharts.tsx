"use client";

import React, { useState, useEffect, useId } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface InvestmentChartsProps {
  investorId: string;
}

type SegmentKey = "verified" | "unverified" | "angel";

const SEGMENT_META: Record<SegmentKey, { label: string; color: string }> = {
  verified: { label: "Verified", color: "#FFFFFF" },
  unverified: { label: "Unverified", color: "#E5E5E5" },
  angel: { label: "Angel", color: "#B3B3B3" },
};

export default function InvestmentCharts({ investorId }: InvestmentChartsProps) {
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

  const groupedInvestments = {
    verified: investments.filter((inv) => inv.type === "verified"),
    unverified: investments.filter((inv) => inv.type === "unverified"),
    angel: investments.filter((inv) => inv.type === "angel"),
  };

  const totals = {
    verified: groupedInvestments.verified.reduce((sum, inv) => sum + (inv.amountUsd || 0), 0),
    unverified: groupedInvestments.unverified.reduce((sum, inv) => sum + (inv.amountUsd || 0), 0),
    angel: groupedInvestments.angel.reduce((sum, inv) => sum + (inv.amountUsd || 0), 0),
  };

  const totalOverall = totals.verified + totals.unverified + totals.angel;

  const baseSegments = (Object.keys(SEGMENT_META) as SegmentKey[]).map((key) => ({
    key,
    label: SEGMENT_META[key].label,
    color: SEGMENT_META[key].color,
    value: totals[key],
    gradientId: `${chartInstanceId}-${key}-gradient`,
    glowId: `${chartInstanceId}-${key}-glow`,
  }));

  const hasAnyValue = baseSegments.some((seg) => seg.value > 0);

  if (!hasAnyValue && !investments.length) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_18px_45px_rgba(0,0,0,0.2)] backdrop-blur">
        <div className="text-white/60 text-sm text-center py-8">
          No verified, unverified, or angel investments captured yet.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_18px_45px_rgba(0,0,0,0.2)] backdrop-blur">
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        {/* Summary */}
        <div className="lg:w-5/12 space-y-4">
          <div>
            <p className="text-[11px] tracking-[0.16em] uppercase text-white/60">
              Overview
            </p>
            <h2 className="mt-1 text-[20px] font-semibold text-white">
              Investment Distribution
            </h2>
            {totalOverall > 0 && (
              <p className="mt-2 text-sm text-white/65">
                Showing the mix of verified, unverified, and angel positions captured on Supershares.
              </p>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {baseSegments.map((segment) => (
              <div className="flex items-center justify-between" key={segment.key}>
                <span className="text-xs uppercase tracking-[0.16em] text-white/55">
                  {segment.label.toLowerCase()} investments
                </span>
                <span className="text-sm font-semibold text-white">
                  {segment.value > 0 ? `$${segment.value.toLocaleString()}` : "—"}
                </span>
              </div>
            ))}

            {totalOverall > 0 && (
              <div className="pt-2 border-t border-white/10 mt-2 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.16em] text-white/60">
                  Total captured
                </span>
                <span className="text-sm font-semibold text-white">
                  ${totalOverall.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Three compact glowing charts */}
        <div className="lg:w-7/12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {baseSegments.map((segment) => {
            const segmentInvestments = groupedInvestments[segment.key];
            const chartData = segmentInvestments.map((inv) => ({
              name: segment.key === "angel" 
                ? (inv.companyName || "Unknown")
                : (inv.projectName || inv.tokenSymbol || "Unknown"),
              value: inv.amountUsd || 0,
            }));

            const hasNonZero = chartData.some((d) => d.value > 0);
            const displayData = hasNonZero ? chartData : chartData.map((d) => ({ ...d, value: 1 }));

            return (
              <div key={segment.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">{segment.label}</h3>
                  <span className="text-xs text-white/60">
                    {hasNonZero
                      ? `$${segment.value.toLocaleString()}`
                      : `${chartData.length} investment${chartData.length === 1 ? "" : "s"}`}
                  </span>
                </div>

                {chartData.length > 0 ? (
                  <div className="relative w-full h-48 flex items-center justify-center">
                    {/* Glow behind chart */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-white/10 blur-2xl" />

                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          <linearGradient id={segment.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={segment.color} stopOpacity={0.95} />
                            <stop offset="50%" stopColor={segment.color} stopOpacity={0.85} />
                            <stop offset="100%" stopColor={segment.color} stopOpacity={0.8} />
                          </linearGradient>
                          <filter id={segment.glowId}>
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <Pie
                          data={displayData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ percent }) =>
                            percent > 0.12 ? `${(percent * 100).toFixed(0)}%` : ""
                          }
                          outerRadius={70}
                          innerRadius={42}
                          stroke="transparent"
                          cornerRadius={16}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {displayData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`url(#${segment.gradientId})`}
                              filter={hasNonZero ? `url(#${segment.glowId})` : undefined}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => `$${value.toLocaleString()}`}
                          contentStyle={{
                            backgroundColor: "rgba(0, 0, 0, 0.95)",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                          itemStyle={{
                            color: "#fff",
                          }}
                          labelStyle={{
                            color: "#fff",
                            fontWeight: "600",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-white/40 text-sm">
                    No {segment.label.toLowerCase()} investments
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

