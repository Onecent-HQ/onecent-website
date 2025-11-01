"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface OnChainFocusChartProps {
  onChainFocusPct: number;
}

const COLORS = ["#0A66C2", "#E0E7FF"];

export default function OnChainFocusChart({ onChainFocusPct }: OnChainFocusChartProps) {
  const chartData = [
    { name: "On-chain", value: onChainFocusPct },
    { name: "Off-chain", value: 100 - onChainFocusPct },
  ];

  return (
    <>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="text-center text-sm text-gray-600 mt-2">
        {onChainFocusPct}% on-chain focus
      </p>
    </>
  );
}

