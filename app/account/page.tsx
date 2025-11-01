"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Slider from "@/components/Slider";
import SegmentedControl from "@/components/SegmentedControl";
import MultiSelect from "@/components/MultiSelect";
import FieldGroup from "@/components/FieldGroup";
import Toast from "@/components/Toast";
import { useUser } from "@civic/auth/react";

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

interface TopInvestment {
  projectName: string;
  tokenCA: string;
}

interface InvestorData {
  name: string;
  headline?: string;
  bio?: string;
  xHandle?: string;
  telegram?: string;
  niches?: string[];
  topInvestments?: TopInvestment[];
  prefs: {
    avgTicketSizeUsd?: number;
    stageFocus?: "preseed" | "seed" | "seriesA" | "later";
    onChainFocusPct?: number;
    activityLevel?: "low" | "medium" | "high";
    checksPerYear?: number;
    openToColdPitches?: boolean;
  };
}

export default function AccountPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [formData, setFormData] = useState<InvestorData>({
    name: "",
    headline: "",
    bio: "",
    xHandle: "",
    telegram: "",
    niches: [],
    topInvestments: [],
    prefs: {
      avgTicketSizeUsd: 50000,
      stageFocus: "seed",
      onChainFocusPct: 50,
      activityLevel: "medium",
      checksPerYear: 10,
      openToColdPitches: false,
    },
  });

  useEffect(() => {
    if (!user) {
      router.push("/signin");
      return;
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/me", { cache: "no-store" });

      if (response.status === 404) {
        if (user) {
          setFormData((prev) => ({
            ...prev,
            name: user.name || "",
            xHandle: (user as any)?.username || user.name?.replace("@", "") || "",
          }));
        }
        setIsLoading(false);
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch profile");

      const data = await response.json();
      if (data.investor) {
        setFormData({
          name: data.investor.name || "",
          headline: data.investor.headline || "",
          bio: data.investor.bio || "",
          xHandle: data.investor.xHandle || "",
          telegram: data.investor.telegram || "",
          niches: data.investor.niches || [],
          topInvestments: data.investor.topInvestments || [],
          prefs: {
            avgTicketSizeUsd: data.investor.prefs?.avgTicketSizeUsd || 50000,
            stageFocus: data.investor.prefs?.stageFocus || "seed",
            onChainFocusPct: data.investor.prefs?.onChainFocusPct || 50,
            activityLevel: data.investor.prefs?.activityLevel || "medium",
            checksPerYear: data.investor.prefs?.checksPerYear || 10,
            openToColdPitches: data.investor.prefs?.openToColdPitches || false,
          },
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setToast({ message: "Failed to load profile", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setToast(null);

    try {
      const response = await fetch("/api/investor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save profile");

      setToast({ message: "Profile saved successfully", type: "success" });
      router.refresh();
    } catch (error: any) {
      setToast({ message: error.message || "Failed to save profile", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const addInvestment = () => {
    setFormData((prev) => ({
      ...prev,
      topInvestments: [...(prev.topInvestments || []), { projectName: "", tokenCA: "" }],
    }));
  };

  const updateInvestment = (index: number, field: keyof TopInvestment, value: string) => {
    const investments = [...(formData.topInvestments || [])];
    investments[index] = { ...investments[index], [field]: value };
    setFormData({ ...formData, topInvestments: investments });
  };

  const removeInvestment = (index: number) => {
    const investments = [...(formData.topInvestments || [])];
    investments.splice(index, 1);
    setFormData({ ...formData, topInvestments: investments });
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen grid place-items-center"
        style={{
          background:
            "radial-gradient(1200px 500px at 10% -10%, rgba(10,102,194,0.12), transparent 60%), radial-gradient(900px 420px at 90% 0%, rgba(10,102,194,0.10), transparent 55%), linear-gradient(180deg, #F8FAFF, #F3F7FF)",
        }}
      >
        <div className="animate-pulse text-sm text-gray-600 tracking-wide">Loading</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-10 md:py-14"
      style={{
        background:
          "radial-gradient(1200px 500px at 10% -10%, rgba(10,102,194,0.12), transparent 60%), radial-gradient(900px 420px at 90% 0%, rgba(10,102,194,0.10), transparent 55%), linear-gradient(180deg, #F8FAFF, #F3F7FF)",
      }}
    >
      {/* Header */}
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
              Your Profile
            </h1>
            <p className="text-[15px] text-slate-600">
              Create and manage your investor profile
            </p>
          </div>
          <Link href="/investors" className="flex-shrink-0">
            <Button
              type="button"
              className="whitespace-nowrap ss-button px-4 py-2 text-[14px]"
            >
              ← Back to Investors
            </Button>
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-6xl px-4 md:px-6 mt-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Identity */}
          <GlassCard className="ss-glass rounded-2xl border border-[rgba(10,102,194,0.16)]">
            <FieldGroup title="Identity" description="Tell us who you are. Keep it concise and specific.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name"
                  maxLength={80}
                />
                <Input
                  label="Headline"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="Short professional headline"
                  maxLength={140}
                />
              </div>
              <div className="mt-4">
                <Textarea
                  label="Bio / Description"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Share your focus, track record, and what you’re looking for next"
                  maxLength={1000}
                  className="min-h-[140px]"
                />
                <div className="mt-1 text-xs text-slate-500 text-right">
                  {(formData.bio?.length || 0)}/1000
                </div>
              </div>
            </FieldGroup>
          </GlassCard>

          {/* Contacts */}
          <GlassCard className="ss-glass rounded-2xl border border-[rgba(10,102,194,0.16)]">
            <FieldGroup title="Contacts" description="Your public X handle and a gated Telegram handle.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="X Handle"
                  value={formData.xHandle}
                  onChange={(e) => setFormData({ ...formData, xHandle: e.target.value.replace("@", "") })}
                  placeholder="yourhandle"
                />
                <Input
                  label="Telegram Handle"
                  value={formData.telegram}
                  onChange={(e) => setFormData({ ...formData, telegram: e.target.value.replace("@", "") })}
                  placeholder="yourhandle"
                />
              </div>
              <p className="text-sm text-slate-600 mt-3">
                Your Telegram handle will not be public by default. A small subscription fee is required for users to contact you; it is risk-free.
              </p>
            </FieldGroup>
          </GlassCard>

          {/* Niches */}
          <GlassCard className="ss-glass rounded-2xl border border-[rgba(10,102,194,0.16)] relative z-40">
            <FieldGroup title="Niches / Fields" description="Select your core interests. Add others if needed.">
              <MultiSelect
                options={NICHE_OPTIONS}
                value={formData.niches || []}
                onChange={(niches) => setFormData({ ...formData, niches })}
                allowOther
                maxSelections={6}
                label="Select your investment niches"
              />
            </FieldGroup>
          </GlassCard>

          {/* Investments */}
          <GlassCard className="ss-glass rounded-2xl border border-[rgba(10,102,194,0.16)]">
            <FieldGroup title="Investments" description="Add your investments. You can list up to three top entries.">
              <div className="space-y-5">
                {(formData.topInvestments || []).map((investment, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-[rgba(10,102,194,0.16)] bg-white/70 backdrop-blur p-5 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-slate-700 tracking-wide">
                        Investment #{index + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => removeInvestment(index)}
                        className="px-3 py-1.5 text-[13px]"
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Project Name"
                        required
                        value={investment.projectName}
                        onChange={(e) => updateInvestment(index, "projectName", e.target.value)}
                        placeholder="e.g., Solana, Ethereum"
                      />
                      <Input
                        label="Token Contract Address (CA)"
                        required
                        value={investment.tokenCA}
                        onChange={(e) => updateInvestment(index, "tokenCA", e.target.value.trim())}
                        placeholder="Token contract address"
                      />
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    type="button"
                    onClick={addInvestment}
                    className="ss-button w-full"
                  >
                    + Add Investment
                  </Button>
                  <div className="text-[13px] text-slate-600 self-center">
                    Tip: highlight up to three top investments for fastest review.
                  </div>
                </div>
              </div>
            </FieldGroup>
          </GlassCard>

          {/* Preferences */}
          <GlassCard className="ss-glass rounded-2xl border border-[rgba(10,102,194,0.16)]">
            <FieldGroup title="Investment Preferences" description="Sliders and selectors to make this fast.">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Slider
                    label="Average Ticket Size (USD)"
                    min={5000}
                    max={1000000}
                    step={5000}
                    value={formData.prefs.avgTicketSizeUsd || 50000}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        prefs: { ...formData.prefs, avgTicketSizeUsd: value },
                      })
                    }
                    formatValue={(v) => `$${v.toLocaleString()}`}
                  />
                  <Slider
                    label="On-chain Focus (%)"
                    min={0}
                    max={100}
                    step={5}
                    value={formData.prefs.onChainFocusPct || 50}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        prefs: { ...formData.prefs, onChainFocusPct: value },
                      })
                    }
                    formatValue={(v) => `${v}%`}
                  />
                  <Slider
                    label="Checks per Year"
                    min={0}
                    max={50}
                    step={1}
                    value={formData.prefs.checksPerYear || 10}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        prefs: { ...formData.prefs, checksPerYear: value },
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SegmentedControl
                    label="Stage Focus"
                    value={formData.prefs.stageFocus || "seed"}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        prefs: { ...formData.prefs, stageFocus: value as any },
                      })
                    }
                    options={[
                      { value: "preseed", label: "Pre-seed" },
                      { value: "seed", label: "Seed" },
                      { value: "seriesA", label: "Series A" },
                      { value: "later", label: "Later" },
                    ]}
                  />
                  <SegmentedControl
                    label="Activity Level"
                    value={formData.prefs.activityLevel || "medium"}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        prefs: { ...formData.prefs, activityLevel: value as any },
                      })
                    }
                    options={[
                      { value: "low", label: "Low" },
                      { value: "medium", label: "Medium" },
                      { value: "high", label: "High" },
                    ]}
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="coldPitches"
                    checked={formData.prefs.openToColdPitches || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prefs: { ...formData.prefs, openToColdPitches: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-[rgba(10,102,194,1)] border-slate-300 rounded focus:ring-[rgba(10,102,194,0.5)]"
                  />
                  <label htmlFor="coldPitches" className="text-sm font-medium text-slate-700">
                    Open to cold pitches
                  </label>
                </div>
              </div>
            </FieldGroup>
          </GlassCard>

          {/* Save */}
          <div className="sticky bottom-4 flex justify-end">
            <div className="rounded-full bg-white/60 backdrop-blur px-3 py-3 shadow-md border border-[rgba(10,102,194,0.16)]">
              <Button type="submit" isLoading={isSaving} className="ss-button px-5 py-2.5">
                Save Profile
              </Button>
            </div>
          </div>
        </form>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
