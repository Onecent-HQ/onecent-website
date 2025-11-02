import { notFound } from "next/navigation";
import { Verified, Lock, ExternalLink } from "lucide-react";
import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import Button from "@/components/Button";
import OnChainFocusChart from "@/components/OnChainFocusChart";
import XLogo from "@/components/XLogo";
import connectDB from "@/lib/db";
import Investor from "@/models/Investor";

export default async function ProfilePage({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  try {
    await connectDB();

    const investor = await Investor.findOne({ slug })
      .select("-__v -_id")
      .lean();

    if (!investor) notFound();

    // Gate Telegram; keep logic intact
    const publicInvestor = {
      ...investor,
      telegram: investor.contactPass?.enabled ? investor.telegram : undefined,
      verified: investor.verified || false,
    } as any;

    const solscanUrl = (a: string) => `https://solscan.io/token/${a}`;

    const highlightStats = [
      publicInvestor.prefs?.stageFocus
        ? {
            label: "Stage Focus",
            value: publicInvestor.prefs.stageFocus
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (s: string) => s.toUpperCase())
              .trim(),
          }
        : null,
      publicInvestor.prefs?.activityLevel
        ? {
            label: "Activity Level",
            value: publicInvestor.prefs.activityLevel,
          }
        : null,
      publicInvestor.prefs?.avgTicketSizeUsd
        ? {
            label: "Avg Ticket",
            value: `$${publicInvestor.prefs.avgTicketSizeUsd.toLocaleString()}`,
          }
        : null,
    ].filter(Boolean) as Array<{ label: string; value: string }>;

    const filteredInvestments = (publicInvestor.topInvestments || [])
      .filter((inv: any) => inv?.projectName && inv?.tokenCA)
      .slice(0, 12);

    const quickPreferences = [
      "onChainFocusPct" in (publicInvestor.prefs || {})
        ? {
            label: "On-chain Focus",
            value: `${publicInvestor.prefs.onChainFocusPct}%`,
          }
        : null,
      publicInvestor.prefs?.checksPerYear
        ? {
            label: "Checks / Year",
            value: `${publicInvestor.prefs.checksPerYear}`,
          }
        : null,
      publicInvestor.prefs?.avgTicketSizeUsd
        ? {
            label: "Avg Ticket",
            value: `$${publicInvestor.prefs.avgTicketSizeUsd.toLocaleString()}`,
          }
        : null,
      publicInvestor.prefs?.stageFocus
        ? {
            label: "Preferred Stage",
            value: publicInvestor.prefs.stageFocus
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (s: string) => s.toUpperCase())
              .trim(),
          }
        : null,
      publicInvestor.prefs?.activityLevel
        ? {
            label: "Involvement",
            value: publicInvestor.prefs.activityLevel,
          }
        : null,
    ].filter(Boolean) as Array<{ label: string; value: string }>;

    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[#EFF4FF] via-white to-[#F5F5FF]" />
        <div className="absolute -top-24 -left-[-10%] h-[420px] w-[420px] -z-10 rounded-full bg-[#0A66C2]/15 blur-[180px]" />
        <div className="absolute top-[40%] right-[-15%] h-[360px] w-[360px] -z-10 rounded-full bg-[#6366F1]/12 blur-[180px]" />

        <div className="relative mx-auto w-full max-w-6xl px-4 md:px-6 py-16">
          <GlassCard className="!p-0 overflow-hidden rounded-[32px] border border-white/50 bg-white/70 shadow-[0_35px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
            <div className="relative">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-48 rounded-b-[48px] bg-gradient-to-br from-[#DDEBFF]/70 via-white/40 to-transparent" />

              <div className="relative flex flex-col gap-12 p-8 md:p-12">
                <section className="grid items-center gap-10 md:grid-cols-[auto,1fr]">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 scale-125 rounded-full bg-gradient-to-br from-[#0A66C2]/10 via-transparent to-transparent blur-xl" />
                    <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl border border-white/70 bg-gradient-to-br from-white via-white/60 to-[#EFF6FF] text-4xl font-semibold text-[#0A66C2] shadow-[inset_0_10px_30px_rgba(148,163,184,0.18)] md:h-32 md:w-32 md:text-5xl">
                      {publicInvestor.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3 text-slate-900">
                        <h1 className="text-[32px] font-semibold leading-tight md:text-[38px]">
                          {publicInvestor.name}
                        </h1>
                        {publicInvestor.verified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
                            <Verified className="h-4 w-4" /> Verified
                          </span>
                        )}
                      </div>
                      {publicInvestor.headline && (
                        <p className="text-[17px] text-slate-600 md:text-[18px]">
                          {publicInvestor.headline}
                        </p>
                      )}
                      {publicInvestor.xHandle && (
                        <a
                          href={`https://x.com/${publicInvestor.xHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[15px] font-medium text-[#0A66C2] transition hover:text-[#084a8f]"
                        >
                          <XLogo className="h-4 w-4" />@{publicInvestor.xHandle}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>

                    {highlightStats.length ? (
                      <div className="grid gap-4 sm:grid-cols-3">
                        {highlightStats.map((stat) => (
                          <div
                            key={stat.label}
                            className="rounded-2xl border border-white/70 bg-white/60 px-4 py-4 shadow-[0_10px_30px_rgba(148,163,184,0.22)] backdrop-blur"
                          >
                            <p className="text-[13px] uppercase tracking-[0.14em] text-slate-500">
                              {stat.label}
                            </p>
                            <p className="mt-2 text-[18px] font-semibold text-slate-900">
                              {stat.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </section>

                <div className="grid gap-8 lg:grid-cols-12">
                  <div className="space-y-8 lg:col-span-7">
                    <section className="rounded-3xl border border-white/60 bg-white/70 p-7 shadow-[0_18px_45px_rgba(100,116,139,0.18)] backdrop-blur">
                      <h2 className="text-[18px] font-semibold text-slate-900">About</h2>
                      {publicInvestor.bio && publicInvestor.bio.trim() ? (
                        <p className="mt-3 whitespace-pre-wrap text-[16px] leading-relaxed text-slate-600">
                          {publicInvestor.bio}
                        </p>
                      ) : (
                        <p className="mt-3 text-[15px] italic text-slate-500">No bio provided yet.</p>
                      )}
                    </section>

                    <section className="rounded-3xl border border-white/60 bg-white/70 p-7 shadow-[0_18px_45px_rgba(100,116,139,0.18)] backdrop-blur">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-[18px] font-semibold text-slate-900">Focus Niches</h2>
                        {publicInvestor.niches?.length ? (
                          <span className="text-[13px] uppercase tracking-[0.14em] text-slate-400">
                            {publicInvestor.niches.length} areas
                          </span>
                        ) : null}
                      </div>
                      {publicInvestor.niches?.length ? (
                        <div className="mt-4 flex flex-wrap gap-2.5">
                          {publicInvestor.niches.map((n: string, i: number) => (
                            <span
                              key={`${n}-${i}`}
                              className="inline-flex items-center rounded-full border border-[#0A66C2]/20 bg-[#0A66C2]/8 px-4 py-1.5 text-[13.5px] font-medium text-[#0A66C2] backdrop-blur"
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-[15px] italic text-slate-500">No niches selected yet.</p>
                      )}
                    </section>

                    <section className="rounded-3xl border border-white/60 bg-white/70 p-7 shadow-[0_18px_45px_rgba(100,116,139,0.18)] backdrop-blur">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-[18px] font-semibold text-slate-900">Investment Highlights</h2>
                        {filteredInvestments.length ? (
                          <span className="text-[13px] uppercase tracking-[0.14em] text-slate-400">
                            {filteredInvestments.length} listings
                          </span>
                        ) : null}
                      </div>
                      {filteredInvestments.length ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {filteredInvestments.map((inv: any, i: number) => (
                            <a
                              key={`${inv.projectName}-${i}`}
                              href={solscanUrl(inv.tokenCA)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={inv.tokenCA}
                              className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 px-4 py-4 shadow-[0_16px_32px_rgba(148,163,184,0.22)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(100,116,139,0.25)]"
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-[#0A66C2]/8 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                              <div className="relative flex items-start justify-between">
                                <div>
                                  <p className="text-[15px] font-semibold text-slate-900">{inv.projectName}</p>
                                  <p className="mt-1 text-[12px] uppercase tracking-[0.18em] text-slate-400">Solscan</p>
                                </div>
                                <ExternalLink className="h-4 w-4 text-slate-400 transition group-hover:text-[#0A66C2]" />
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-[15px] italic text-slate-500">No listed investments yet.</p>
                      )}
                    </section>
                  </div>

                  <div className="space-y-8 lg:col-span-5">
                    {"onChainFocusPct" in (publicInvestor.prefs || {}) ? (
                      <section className="rounded-3xl border border-white/60 bg-white/70 p-7 shadow-[0_18px_45px_rgba(100,116,139,0.18)] backdrop-blur">
                        <h2 className="text-[18px] font-semibold text-slate-900 mb-6">Portfolio Mix</h2>
                        <div className="flex flex-col items-center gap-6">
                          <div className="relative w-[200px] h-[200px] mx-auto flex-shrink-0">
                            <OnChainFocusChart onChainFocusPct={publicInvestor.prefs.onChainFocusPct} variant="premium" />
                          </div>
                          <div className="space-y-2 text-center w-full">
                            <p className="text-[32px] font-semibold text-slate-900">
                              {publicInvestor.prefs.onChainFocusPct}% On-chain
                            </p>
                            <p className="text-[14px] text-slate-500 leading-relaxed">
                              Weighted focus split across recent allocations.
                            </p>
                          </div>
                        </div>
                      </section>
                    ) : null}

                    {quickPreferences.length ? (
                      <section className="rounded-3xl border border-white/60 bg-white/70 p-7 shadow-[0_18px_45px_rgba(100,116,139,0.18)] backdrop-blur">
                        <h2 className="text-[18px] font-semibold text-slate-900">Quick Preferences</h2>
                        <ul className="mt-4 space-y-4">
                          {quickPreferences.map((pref) => (
                            <li key={pref.label} className="flex items-start justify-between gap-6">
                              <span className="text-[14px] uppercase tracking-[0.14em] text-slate-400">
                                {pref.label}
                              </span>
                              <span className="text-[15px] font-medium text-slate-800">{pref.value}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ) : null}

                    <section className="rounded-3xl border border-white/60 bg-white/70 p-7 shadow-[0_18px_45px_rgba(100,116,139,0.18)] backdrop-blur">
                      <h2 className="text-[18px] font-semibold text-slate-900">Contact</h2>
                      {publicInvestor.telegram ? (
                        <a
                          href={`https://t.me/${publicInvestor.telegram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#0A66C2]/30 bg-[#0A66C2]/10 px-5 py-2.5 text-[15px] font-medium text-[#0A66C2] transition hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/14"
                        >
                          Telegram @{publicInvestor.telegram}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : (
                        <div className="mt-4 space-y-4 rounded-2xl border border-[#0A66C2]/20 bg-[#0A66C2]/10 p-5">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Lock className="h-4 w-4" />
                            <span className="text-[15px] font-medium">Exclusive channel</span>
                          </div>
                          <p className="text-[14px] text-slate-600">
                            Unlock their direct line with a Supershares subscription.
                          </p>
                          <Button variant="primary" className="w-full justify-center text-sm">
                            Subscribe to Unlock
                          </Button>
                        </div>
                      )}
                    </section>
                  </div>
                </div>

                <div className="border-t border-white/60 pt-6 text-[14px] text-slate-500">
                  <Link href="/investors" className="inline-flex items-center gap-2 font-medium text-slate-600 transition hover:text-[#0A66C2]">
                    ← Back to Investors
                  </Link>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Profile page error:", error);
    notFound();
  }
}
