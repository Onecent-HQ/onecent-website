"use client";

import { useState } from "react";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import MultiSelect from "@/components/MultiSelect";
import SegmentedControl from "@/components/SegmentedControl";
import { Plus, X } from "lucide-react";

const NICHE_OPTIONS = [
  "DePIN",
  "RWA",
  "Infra",
  "Payments",
  "DeFi",
  "Gaming",
  "Tooling",
  "AI",
  "Consumer",
  "Privacy",
  "Marketplaces",
  "Other",
];

const STAGE_OPTIONS = [
  { value: "preseed", label: "Pre-seed" },
  { value: "seed", label: "Seed" },
  { value: "seriesA", label: "Series A" },
  { value: "later", label: "Later" },
];

export interface AngelInvestment {
  companyName: string;
  amountUsd: number;
  notes?: string;
  tags: string[];
  stage: string;
}

interface AngelInvestmentsSectionProps {
  angelInvestments: AngelInvestment[];
  onChange: (investments: AngelInvestment[]) => void;
}

export default function AngelInvestmentsSection({
  angelInvestments = [],
  onChange,
}: AngelInvestmentsSectionProps) {
  const [doesAngelInvest, setDoesAngelInvest] = useState<boolean | null>(
    angelInvestments.length > 0 ? true : null
  );

  const addInvestment = () => {
    onChange([
      ...angelInvestments,
      {
        companyName: "",
        amountUsd: 0,
        notes: "",
        tags: [],
        stage: "seed",
      },
    ]);
  };

  const updateInvestment = (index: number, field: keyof AngelInvestment, value: any) => {
    const updated = [...angelInvestments];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeInvestment = (index: number) => {
    const updated = angelInvestments.filter((_, i) => i !== index);
    onChange(updated);
    if (updated.length === 0) {
      setDoesAngelInvest(false);
    }
  };

  const handleToggle = (value: boolean) => {
    setDoesAngelInvest(value);
    if (value) {
      // If they say yes and have no investments, add one empty form
      if (angelInvestments.length === 0) {
        addInvestment();
      }
    } else {
      // If they say no, clear all investments
      onChange([]);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Question: Do you angel invest as well? */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-white/90">
          Do you angel invest as well?
        </p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => handleToggle(true)}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              doesAngelInvest === true
                ? "bg-white text-black border border-white"
                : "bg-white/5 text-white/80 border border-white/20 hover:bg-white/10"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => handleToggle(false)}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              doesAngelInvest === false
                ? "bg-white text-black border border-white"
                : "bg-white/5 text-white/80 border border-white/20 hover:bg-white/10"
            }`}
          >
            No
          </button>
        </div>
      </div>

      {/* Investment Forms - Only show if they answered Yes */}
      {doesAngelInvest === true && (
        <div className="space-y-6">
          {angelInvestments.map((investment, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-white/20 bg-white/5 space-y-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-white">
                  Investment {index + 1}
                </h4>
                {angelInvestments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInvestment(index)}
                    className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Remove investment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <Input
                label="Company Name *"
                value={investment.companyName}
                onChange={(e) =>
                  updateInvestment(index, "companyName", e.target.value)
                }
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Amount (USD) *"
                  type="number"
                  value={investment.amountUsd || ""}
                  onChange={(e) =>
                    updateInvestment(
                      index,
                      "amountUsd",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  required
                  min="0"
                />

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Stage *
                  </label>
                  <SegmentedControl
                    options={STAGE_OPTIONS}
                    value={investment.stage}
                    onChange={(value) =>
                      updateInvestment(index, "stage", value)
                    }
                  />
                </div>
              </div>

              <Textarea
                label="Notes (optional)"
                value={investment.notes || ""}
                onChange={(e) =>
                  updateInvestment(index, "notes", e.target.value)
                }
                rows={3}
              />

              <MultiSelect
                label="Tags"
                options={NICHE_OPTIONS}
                value={investment.tags || []}
                onChange={(tags) => updateInvestment(index, "tags", tags)}
                allowOther
                maxSelections={6}
              />
            </div>
          ))}

          {/* Add Another Investment Button */}
          <button
            type="button"
            onClick={addInvestment}
            className="w-full px-5 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/20 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Another Investment
          </button>
        </div>
      )}
    </div>
  );
}
