import { notFound } from "next/navigation";
import { Verified, Lock, ExternalLink, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import Button from "@/components/Button";
import XLogo from "@/components/XLogo";
import connectDB from "@/lib/db";
import Investor from "@/models/Investor";
import ProfileNav from "./ProfileNav";
import ShareProfile from "./ShareProfile";
import SubscribeButton from "./SubscribeButton";
import PitchButton from "./PitchButton";
import OnChainFocusChart from "@/components/OnChainFocusChart";

export default async function ProfilePage({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  try {
    await connectDB();

    const investor = await Investor.findOne({ slug })
      .select("-__v")
      .lean();

    // Ensure profileImage is included
    const investorWithImage = investor ? {
      ...investor,
      profileImage: investor.profileImage || undefined,
    } : null;

    if (!investorWithImage) notFound();

    // Gate Telegram; keep logic intact
    const publicInvestor = {
      ...investorWithImage,
      telegram: investorWithImage.contactPass?.enabled ? investorWithImage.telegram : undefined,
      verified: investorWithImage.verified || false,
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

    // Filter investments and ensure no balance/holdings data is exposed
    const filteredInvestments = (publicInvestor.topInvestments || [])
      .filter((inv: any) => inv?.projectName && inv?.tokenCA)
      .map((inv: any) => ({
        // Only expose projectName and tokenCA - never expose balance/holdings
        projectName: inv.projectName,
        tokenCA: inv.tokenCA,
      }))
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
      <div className="relative min-h-screen overflow-hidden bg-black">
        {/* Navigation Bar */}
        <ProfileNav />
        
        <div className="relative mx-auto w-full max-w-6xl px-4 md:px-6 py-16">
          <GlassCard className="!p-0 overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_35px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
            <div className="relative">
              <div className="relative flex flex-col gap-12 p-8 md:p-12">
                <section className="grid items-center gap-10 md:grid-cols-[auto,1fr]">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 scale-125 rounded-full bg-gradient-to-br from-white/10 via-transparent to-transparent blur-xl" />
                    {publicInvestor.profileImage ? (
                      <div className="relative h-28 w-28 md:h-32 md:w-32 rounded-3xl overflow-hidden border border-white/20 shadow-[inset_0_10px_30px_rgba(0,0,0,0.3)]">
                        {publicInvestor.profileImage.startsWith('data:') ? (
                          <img
                            src={publicInvestor.profileImage}
                            alt={publicInvestor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={publicInvestor.profileImage}
                            alt={publicInvestor.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-white/10 text-4xl font-semibold text-white shadow-[inset_0_10px_30px_rgba(0,0,0,0.3)] md:h-32 md:w-32 md:text-5xl">
                      {publicInvestor.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3 text-white">
                        <h1 className="text-[32px] font-semibold leading-tight md:text-[38px]">
                          {publicInvestor.name}
                        </h1>
                        {publicInvestor.verified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-400 border border-green-500/30">
                            <Verified className="h-4 w-4" /> Verified
                          </span>
                        )}
                      </div>
                      {publicInvestor.headline && (
                        <p className="text-[17px] text-white/70 md:text-[18px]">
                          {publicInvestor.headline}
                        </p>
                      )}
                      {publicInvestor.xHandle && (
                        <a
                          href={`https://x.com/${publicInvestor.xHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[15px] font-medium text-white transition hover:text-white/80"
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
                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur"
                          >
                            <p className="text-[13px] uppercase tracking-[0.14em] text-white/60">
                              {stat.label}
                            </p>
                            <p className="mt-2 text-[18px] font-semibold text-white">
                              {stat.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </section>

                {/* Investment Distribution - Full Width */}
                {publicInvestor._id && (
                  <OnChainFocusChart investorId={publicInvestor._id.toString()} />
                )}

                <div className="grid gap-8 lg:grid-cols-12">
                  <div className="space-y-8 lg:col-span-7">
                    <section className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_18px_45px_rgba(0,0,0,0.2)] backdrop-blur">
                      <h2 className="text-[18px] font-semibold text-white">About</h2>
                      {publicInvestor.bio && publicInvestor.bio.trim() ? (
                        <p className="mt-3 whitespace-pre-wrap text-[16px] leading-relaxed text-white/70">
                          {publicInvestor.bio}
                        </p>
                      ) : (
                        <p className="mt-3 text-[15px] italic text-white/50">No bio provided yet.</p>
                      )}
                    </section>

                    <section className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_18px_45px_rgba(0,0,0,0.2)] backdrop-blur">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-[18px] font-semibold text-white">Focus Niches</h2>
                        {publicInvestor.niches?.length ? (
                          <span className="text-[13px] uppercase tracking-[0.14em] text-white/60">
                            {publicInvestor.niches.length} areas
                          </span>
                        ) : null}
                      </div>
                      {publicInvestor.niches?.length ? (
                        <div className="mt-4 flex flex-wrap gap-2.5">
                          {publicInvestor.niches.map((n: string, i: number) => (
                            <span
                              key={`${n}-${i}`}
                              className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-[13.5px] font-medium text-white backdrop-blur"
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-[15px] italic text-white/50">No niches selected yet.</p>
                      )}
                    </section>

                    <section className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_18px_45px_rgba(0,0,0,0.2)] backdrop-blur">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-[18px] font-semibold text-white">Investment Highlights</h2>
                        {filteredInvestments.length ? (
                          <span className="text-[13px] uppercase tracking-[0.14em] text-white/60">
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
                              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-4 shadow-[0_16px_32px_rgba(0,0,0,0.2)] transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/10 hover:shadow-[0_20px_50px_rgba(255,255,255,0.15)]"
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                              <div className="relative flex items-start justify-between">
                                <div>
                                  <p className="text-[15px] font-semibold text-white">{inv.projectName}</p>
                                  <p className="mt-1 text-[12px] uppercase tracking-[0.18em] text-white/50">Solscan</p>
                                </div>
                                <ExternalLink className="h-4 w-4 text-white/40 transition group-hover:text-white" />
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-[15px] italic text-white/50">No listed investments yet.</p>
                      )}
                    </section>
                  </div>

                  <div className="space-y-8 lg:col-span-5">
                    {quickPreferences.length ? (
                      <section className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_18px_45px_rgba(0,0,0,0.2)] backdrop-blur">
                        <h2 className="text-[18px] font-semibold text-white">Quick Preferences</h2>
                        <ul className="mt-4 space-y-4">
                          {quickPreferences.map((pref) => (
                            <li key={pref.label} className="flex items-start justify-between gap-6">
                              <span className="text-[14px] uppercase tracking-[0.14em] text-white/60">
                                {pref.label}
                              </span>
                              <span className="text-[15px] font-medium text-white">{pref.value}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ) : null}

                    <section className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_18px_45px_rgba(0,0,0,0.2)] backdrop-blur">
                      <h2 className="text-[18px] font-semibold text-white">Contact</h2>
                      {publicInvestor.prefs?.openToColdPitches && (
                        <div className="mt-4">
                          <PitchButton
                            investorId={publicInvestor._id?.toString() || ""}
                            investorName={publicInvestor.name}
                            openToPitches={publicInvestor.prefs.openToColdPitches}
                          />
                        </div>
                      )}
                      {publicInvestor.telegram ? (
                        <a
                          href={`https://t.me/${publicInvestor.telegram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-[15px] font-medium text-white transition hover:border-white/50 hover:bg-white/20"
                        >
                          Telegram @{publicInvestor.telegram}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : (
                        <div className="mt-4 space-y-4 rounded-2xl border border-white/20 bg-white/10 p-5">
                          <div className="flex items-center gap-2 text-white/80">
                            <Lock className="h-4 w-4" />
                            <span className="text-[15px] font-medium">Exclusive channel</span>
                          </div>
                          <p className="text-[14px] text-white/70">
                            Unlock their direct line with a Supershares.io subscription.
                          </p>
                          <SubscribeButton />
                        </div>
                      )}
                    </section>
                  </div>
                </div>

                <ShareProfile slug={slug} />
                
                <div className="border-t border-white/10 pt-6 text-[14px] text-white/60">
                  <Link href="/investors" className="inline-flex items-center gap-2 font-medium text-white/80 transition hover:text-white">
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
