"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Button from "./Button";
import Input from "./Input";
import MultiSelect from "./MultiSelect";
import Toast from "./Toast";
import { CheckCircle2, XCircle, Plus, X, Edit2, Save } from "lucide-react";
import FieldGroup from "./FieldGroup";

const TAG_OPTIONS = [
  "AI",
  "DePIN",
  "RWA",
  "Infra",
  "DeFi",
  "Gaming",
  "Consumer",
  "Payments",
  "Privacy",
  "Tooling",
  "Marketplaces",
  "Other",
];

interface Investment {
  _id?: string;
  type: "verified" | "unverified" | "angel";
  tokenSymbol?: string;
  projectName?: string;
  tokenCA?: string;
  companyName?: string;
  notes?: string;
  amountUsd: number;
  tags: string[];
  createdAt?: string;
}

interface InvestmentDashboardProps {
  onSaveVerified?: (tokens: any[]) => void;
}

const COLORS = {
  verified: "#FFFFFF",
  unverified: "#CCCCCC",
  angel: "#999999",
};

export default memo(function InvestmentDashboard({ onSaveVerified }: InvestmentDashboardProps) {
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [tempTags, setTempTags] = useState<string[]>([]);
  
  // Forms
  const [showUnverifiedForm, setShowUnverifiedForm] = useState(false);
  const [showAngelForm, setShowAngelForm] = useState(false);
  const [unverifiedForm, setUnverifiedForm] = useState({
    projectName: "",
    tokenSymbol: "",
    tokenCA: "",
    amountUsd: 0,
    tags: [] as string[],
  });
  const [angelForm, setAngelForm] = useState({
    companyName: "",
    amountUsd: 0,
    notes: "",
    tags: [] as string[],
  });

  const fetchInvestments = useCallback(async () => {
    try {
      const response = await fetch("/api/investments");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setInvestments(data.investments || []);
    } catch (error) {
      console.error("Error fetching investments:", error);
      setToast({ message: "Failed to load investments", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const fetchWalletTokens = async () => {
    if (!wallet.publicKey) return;

    try {
      const response = await fetch("/api/verify-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pubkey: wallet.publicKey.toString() }),
      });

      const data = await response.json();
      if (data.error && (!data.tokens || data.tokens.length === 0)) {
        setToast({ message: "No tokens found in wallet", type: "info" });
        return;
      }

      const tokens = data.tokens || [];
      
      // Calculate USD amounts (simplified - in production, use price API)
      const tokensWithAmounts = tokens.map((token: any) => ({
        ...token,
        amountUsd: 0, // Placeholder - should fetch from price API
        tags: [],
      }));

      // Save verified investments
      const saveResponse = await fetch("/api/investments/verified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokens: tokensWithAmounts }),
      });

      if (saveResponse.ok) {
        setToast({ message: `Saved ${tokens.length} verified investments`, type: "success" });
        fetchInvestments();
        if (onSaveVerified) onSaveVerified(tokensWithAmounts);
      }
    } catch (error) {
      console.error("Error fetching tokens:", error);
      setToast({ message: "Failed to fetch wallet tokens", type: "error" });
    }
  };

  const handleAddUnverified = async () => {
    if (!unverifiedForm.projectName || !unverifiedForm.amountUsd) {
      setToast({ message: "Please fill required fields", type: "error" });
      return;
    }

    try {
      const response = await fetch("/api/investments/unverified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(unverifiedForm),
      });

      if (!response.ok) throw new Error("Failed to create");
      
      setToast({ message: "Investment added", type: "success" });
      setShowUnverifiedForm(false);
      setUnverifiedForm({ projectName: "", tokenSymbol: "", tokenCA: "", amountUsd: 0, tags: [] });
      fetchInvestments();
    } catch (error) {
      setToast({ message: "Failed to add investment", type: "error" });
    }
  };

  const handleAddAngel = async () => {
    if (!angelForm.companyName || !angelForm.amountUsd) {
      setToast({ message: "Please fill required fields", type: "error" });
      return;
    }

    try {
      const response = await fetch("/api/investments/angel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(angelForm),
      });

      if (!response.ok) throw new Error("Failed to create");
      
      setToast({ message: "Angel investment added", type: "success" });
      setShowAngelForm(false);
      setAngelForm({ companyName: "", amountUsd: 0, notes: "", tags: [] });
      fetchInvestments();
    } catch (error) {
      setToast({ message: "Failed to add investment", type: "error" });
    }
  };

  const handleDeleteInvestment = async (id?: string) => {
    if (!id) return;
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

  const handleStartEditTags = (investment: Investment) => {
    if (!investment._id) return;
    setEditingTags(investment._id);
    setTempTags([...investment.tags]);
  };

  const handleSaveTags = async (id: string) => {
    try {
      const response = await fetch(`/api/investments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: tempTags }),
      });

      if (!response.ok) throw new Error("Failed to update");
      
      setToast({ message: "Tags updated", type: "success" });
      setEditingTags(null);
      fetchInvestments();
    } catch (error) {
      setToast({ message: "Failed to update tags", type: "error" });
    }
  };

  const groupedInvestments = {
    verified: investments.filter((inv) => inv.type === "verified"),
    unverified: investments.filter((inv) => inv.type === "unverified"),
    angel: investments.filter((inv) => inv.type === "angel"),
  };

  const chartData = {
    verified: groupedInvestments.verified.map((inv) => ({
      name: inv.projectName || inv.tokenSymbol || "Unknown",
      value: inv.amountUsd,
    })),
    unverified: groupedInvestments.unverified.map((inv) => ({
      name: inv.projectName || inv.tokenSymbol || "Unknown",
      value: inv.amountUsd,
    })),
    angel: groupedInvestments.angel.map((inv) => ({
      name: inv.companyName || "Unknown",
      value: inv.amountUsd,
    })),
  };

  const renderPieChart = (data: any[], type: "verified" | "unverified" | "angel", title: string) => {
    if (data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-white/40 text-sm">
          No {title.toLowerCase()} investments
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[type]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (isLoading) {
    return <div className="text-white/60">Loading investments...</div>;
  }

  return (
    <div className="py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <FieldGroup
        title="Investments"
        description="Manage your verified, unverified, and angel investments. Connect your wallet to auto-detect tokens."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* Left: Investment List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Investments</h2>
            <div className="flex gap-2">
              {wallet.connected && wallet.publicKey && (
                <Button
                  onClick={fetchWalletTokens}
                  className="text-sm px-4 py-2"
                >
                  Fetch Verified
                </Button>
              )}
              {!wallet.connected && (
                <div className="[&_button]:!text-sm [&_button]:!px-4 [&_button]:!py-2">
                  <WalletMultiButton />
                </div>
              )}
            </div>
          </div>

          {/* Verified Investments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Verified</h3>
              <span className="text-sm text-white/60">
                {groupedInvestments.verified.length} items
              </span>
            </div>
            {groupedInvestments.verified.length === 0 ? (
              <p className="text-sm text-white/40">No verified investments</p>
            ) : (
              <div className="space-y-2">
                {groupedInvestments.verified.map((inv) => (
                  <InvestmentCard
                    key={inv._id}
                    investment={inv}
                    onDelete={handleDeleteInvestment}
                    onEditTags={handleStartEditTags}
                    editingTags={editingTags === inv._id}
                    tempTags={tempTags}
                    onTagsChange={setTempTags}
                    onSaveTags={() => handleSaveTags(inv._id!)}
                    onCancelEdit={() => setEditingTags(null)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Unverified Investments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Unverified</h3>
              <Button
                onClick={() => setShowUnverifiedForm(!showUnverifiedForm)}
                className="text-sm px-3 py-1.5"
                variant="secondary"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            {showUnverifiedForm && (
              <div className="p-4 rounded-lg border border-white/20 bg-white/5 space-y-3">
                <Input
                  label="Project Name"
                  value={unverifiedForm.projectName}
                  onChange={(e) =>
                    setUnverifiedForm({ ...unverifiedForm, projectName: e.target.value })
                  }
                  required
                />
                <Input
                  label="Token Symbol (optional)"
                  value={unverifiedForm.tokenSymbol}
                  onChange={(e) =>
                    setUnverifiedForm({ ...unverifiedForm, tokenSymbol: e.target.value })
                  }
                />
                <Input
                  label="Token Address (optional)"
                  value={unverifiedForm.tokenCA}
                  onChange={(e) =>
                    setUnverifiedForm({ ...unverifiedForm, tokenCA: e.target.value })
                  }
                />
                <Input
                  label="Amount (USD)"
                  type="number"
                  value={unverifiedForm.amountUsd || ""}
                  onChange={(e) =>
                    setUnverifiedForm({
                      ...unverifiedForm,
                      amountUsd: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
                <MultiSelect
                  label="Tags"
                  options={TAG_OPTIONS}
                  value={unverifiedForm.tags}
                  onChange={(tags) => setUnverifiedForm({ ...unverifiedForm, tags })}
                  allowOther
                />
                <div className="flex gap-2">
                  <Button onClick={handleAddUnverified} className="text-sm">
                    Save
                  </Button>
                  <Button
                    onClick={() => setShowUnverifiedForm(false)}
                    variant="secondary"
                    className="text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {groupedInvestments.unverified.length === 0 ? (
              <p className="text-sm text-white/40">No unverified investments</p>
            ) : (
              <div className="space-y-2">
                {groupedInvestments.unverified.map((inv) => (
                  <InvestmentCard
                    key={inv._id}
                    investment={inv}
                    onDelete={handleDeleteInvestment}
                    onEditTags={handleStartEditTags}
                    editingTags={editingTags === inv._id}
                    tempTags={tempTags}
                    onTagsChange={setTempTags}
                    onSaveTags={() => handleSaveTags(inv._id!)}
                    onCancelEdit={() => setEditingTags(null)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Angel Investments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Angel</h3>
              <Button
                onClick={() => setShowAngelForm(!showAngelForm)}
                className="text-sm px-3 py-1.5"
                variant="secondary"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            {showAngelForm && (
              <div className="p-4 rounded-lg border border-white/20 bg-white/5 space-y-3">
                <Input
                  label="Company Name"
                  value={angelForm.companyName}
                  onChange={(e) =>
                    setAngelForm({ ...angelForm, companyName: e.target.value })
                  }
                  required
                />
                <Input
                  label="Amount (USD)"
                  type="number"
                  value={angelForm.amountUsd || ""}
                  onChange={(e) =>
                    setAngelForm({
                      ...angelForm,
                      amountUsd: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
                <Input
                  label="Notes (optional)"
                  value={angelForm.notes}
                  onChange={(e) => setAngelForm({ ...angelForm, notes: e.target.value })}
                />
                <MultiSelect
                  label="Tags"
                  options={TAG_OPTIONS}
                  value={angelForm.tags}
                  onChange={(tags) => setAngelForm({ ...angelForm, tags })}
                  allowOther
                />
                <div className="flex gap-2">
                  <Button onClick={handleAddAngel} className="text-sm">
                    Save
                  </Button>
                  <Button
                    onClick={() => setShowAngelForm(false)}
                    variant="secondary"
                    className="text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {groupedInvestments.angel.length === 0 ? (
              <p className="text-sm text-white/40">No angel investments</p>
            ) : (
              <div className="space-y-2">
                {groupedInvestments.angel.map((inv) => (
                  <InvestmentCard
                    key={inv._id}
                    investment={inv}
                    onDelete={handleDeleteInvestment}
                    onEditTags={handleStartEditTags}
                    editingTags={editingTags === inv._id}
                    tempTags={tempTags}
                    onTagsChange={setTempTags}
                    onSaveTags={() => handleSaveTags(inv._id!)}
                    onCancelEdit={() => setEditingTags(null)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Pie Charts */}
        <div className="space-y-8">
          {renderPieChart(chartData.verified, "verified", "Verified Investments")}
          {renderPieChart(chartData.unverified, "unverified", "Unverified Investments")}
          {renderPieChart(chartData.angel, "angel", "Angel Investments")}
        </div>
      </div>
      </FieldGroup>
    </div>
  );
});

function InvestmentCard({
  investment,
  onDelete,
  onEditTags,
  editingTags,
  tempTags,
  onTagsChange,
  onSaveTags,
  onCancelEdit,
}: {
  investment: Investment;
  onDelete: (id?: string) => void;
  onEditTags: (inv: Investment) => void;
  editingTags: boolean;
  tempTags: string[];
  onTagsChange: (tags: string[]) => void;
  onSaveTags: () => void;
  onCancelEdit: () => void;
}) {
  const name =
    investment.type === "angel"
      ? investment.companyName
      : investment.projectName || investment.tokenSymbol || "Unknown";

  return (
    <div className="p-4 rounded-lg border border-white/20 bg-white/5">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-white">{name}</h4>
          <p className="text-sm text-white/60">
            ${investment.amountUsd.toLocaleString()}
          </p>
          {investment.type === "angel" && investment.notes && (
            <p className="text-xs text-white/50 mt-1">{investment.notes}</p>
          )}
        </div>
        <button
          onClick={() => investment._id && onDelete(investment._id)}
          className="text-red-400 hover:text-red-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-3">
        {editingTags ? (
          <div className="space-y-2">
            <MultiSelect
              options={TAG_OPTIONS}
              value={tempTags}
              onChange={onTagsChange}
              allowOther
            />
            <div className="flex gap-2">
              <button
                onClick={onSaveTags}
                className="px-3 py-1 text-xs bg-white/10 text-white rounded hover:bg-white/20"
              >
                <Save className="w-3 h-3 inline mr-1" />
                Save
              </button>
              <button
                onClick={onCancelEdit}
                className="px-3 py-1 text-xs bg-white/5 text-white/60 rounded hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            {investment.tags.length > 0 ? (
              investment.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs rounded bg-white/10 text-white border border-white/20"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-xs text-white/40">No tags</span>
            )}
            <button
              onClick={() => onEditTags(investment)}
              className="text-white/60 hover:text-white"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

