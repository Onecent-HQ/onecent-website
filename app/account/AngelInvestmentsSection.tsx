"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import MultiSelect from "@/components/MultiSelect";
import SegmentedControl from "@/components/SegmentedControl";
import Toast from "@/components/Toast";
import { Plus, X, Trash2 } from "lucide-react";

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

interface AngelInvestment {
  _id?: string;
  companyName: string;
  amountUsd: number;
  notes?: string;
  tags: string[];
  stage: string;
}

export default function AngelInvestmentsSection() {
  const [investments, setInvestments] = useState<AngelInvestment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<AngelInvestment>({
    companyName: "",
    amountUsd: 0,
    notes: "",
    tags: [],
    stage: "seed",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchInvestments = useCallback(async () => {
    try {
      const response = await fetch("/api/investments");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      const angelInvestments = (data.investments || []).filter(
        (inv: any) => inv.type === "angel"
      );
      setInvestments(angelInvestments);
    } catch (error) {
      console.error("Error fetching angel investments:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.amountUsd) {
      setToast({ message: "Please fill required fields", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const url = formData._id 
        ? `/api/investments/${formData._id}`
        : "/api/investments/angel";
      
      const method = formData._id ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: formData.companyName,
          amountUsd: formData.amountUsd,
          notes: formData.notes,
          tags: formData.tags,
          stage: formData.stage,
        }),
      });

      if (!response.ok) throw new Error("Failed to save");
      
      setToast({ message: formData._id ? "Investment updated" : "Investment added", type: "success" });
      setShowForm(false);
      setFormData({ companyName: "", amountUsd: 0, notes: "", tags: [], stage: "seed" });
      fetchInvestments();
    } catch (error) {
      setToast({ message: "Failed to save investment", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/investments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");
      
      setToast({ message: "Investment removed", type: "success" });
      fetchInvestments();
    } catch (error) {
      setToast({ message: "Failed to delete investment", type: "error" });
    }
  };

  const handleEdit = (investment: AngelInvestment) => {
    setFormData(investment);
    setShowForm(true);
  };

  if (isLoading) {
    return <div className="text-white/60 text-sm">Loading...</div>;
  }

  return (
    <div className="mt-6 space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* List of Angel Investments */}
      {investments.length > 0 && (
        <div className="space-y-3">
          {investments.map((investment) => (
            <div
              key={investment._id}
              className="p-4 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h4 className="text-base font-semibold text-white">{investment.companyName}</h4>
                    <span className="px-2 py-1 text-xs font-medium text-white/80 bg-white/10 rounded border border-white/20">
                      {STAGE_OPTIONS.find(s => s.value === investment.stage)?.label || investment.stage}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white">
                    ${investment.amountUsd.toLocaleString()}
                  </p>
                  {investment.notes && (
                    <p className="text-sm text-white/60">{investment.notes}</p>
                  )}
                  {investment.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {investment.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs rounded bg-white/10 text-white border border-white/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(investment)}
                    className="px-3 py-1.5 text-xs text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded border border-white/20 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => investment._id && handleDelete(investment._id)}
                    className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded border border-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="p-6 rounded-lg border border-white/20 bg-white/5 space-y-4">
          <Input
            label="Company Name *"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount (USD) *"
              type="number"
              value={formData.amountUsd || ""}
              onChange={(e) =>
                setFormData({ ...formData, amountUsd: parseFloat(e.target.value) || 0 })
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
                value={formData.stage}
                onChange={(value) => setFormData({ ...formData, stage: value })}
              />
            </div>
          </div>

          <Textarea
            label="Notes (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />

          <MultiSelect
            label="Tags"
            options={NICHE_OPTIONS}
            value={formData.tags}
            onChange={(tags) => setFormData({ ...formData, tags })}
            allowOther
            maxSelections={6}
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Saving..." : formData._id ? "Update" : "Add Investment"}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({ companyName: "", amountUsd: 0, notes: "", tags: [], stage: "seed" });
              }}
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button
          type="button"
          onClick={() => setShowForm(true)}
          variant="secondary"
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Angel Investment
        </Button>
      )}
    </div>
  );
}

