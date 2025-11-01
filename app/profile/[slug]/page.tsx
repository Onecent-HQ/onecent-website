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

    return (
      <div
        className="min-h-screen py-14 px-4 md:px-6 flex justify-center"
        style={{ background: "linear-gradient(180deg,#F9FAFC 0%,#F1F5FB 100%)" }}
      >
        <div className="w-full max-w-5xl">
          <GlassCard className="p-8 md:p-10 bg-white/85 backdrop-blur-md rounded-3xl border border-[rgba(30,41,59,0.10)] shadow-[0_10px_40px_rgba(2,6,23,0.06)]">
            {/* IDENTITY BAND */}
            <div className="rounded-2xl border border-[rgba(30,41,59,0.10)] bg-gradient-to-br from-white to-[#F2F6FC] p-8 mb-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border border-[rgba(30,41,59,0.12)] bg-gradient-to-br from-white to-[rgba(10,102,194,0.10)] flex items-center justify-center text-3xl md:text-4xl font-semibold text-[rgba(10,102,194,1)] shadow-inner">
                  {publicInvestor.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <h1 className="mt-4 text-[28px] md:text-[34px] font-semibold text-slate-900 flex items-center gap-2">
                  {publicInvestor.name}
                  {publicInvestor.verified && <Verified className="w-5 h-5 text-green-600" />}
                </h1>
                {publicInvestor.headline && (
                  <p className="mt-1 text-slate-600 text-[16px] md:text-[17px]">
                    {publicInvestor.headline}
                  </p>
                )}
                {publicInvestor.xHandle && (
                  <a
                    href={`https://x.com/${publicInvestor.xHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 mt-3 text-[15px] text-[rgba(10,102,194,1)] hover:underline"
                  >
                    <XLogo className="w-4 h-4" />
                    @{publicInvestor.xHandle}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* BODY: 2 COLUMNS */}
            <div className="grid grid-cols-12 gap-8">
              {/* LEFT: MAIN CONTENT */}
              <div className="col-span-12 md:col-span-7 space-y-8">
                {/* About */}
                <section className="rounded-2xl border border-[rgba(30,41,59,0.08)] bg-white/85 p-6">
                  <h2 className="text-[17px] font-semibold text-slate-800">About</h2>
                  {publicInvestor.bio && publicInvestor.bio.trim() ? (
                    <p className="mt-3 text-[15px] leading-relaxed text-slate-700 whitespace-pre-wrap max-h-44 overflow-auto pr-1">
                      {publicInvestor.bio}
                    </p>
                  ) : (
                    <p className="mt-3 text-[15px] text-slate-500 italic">No bio provided yet.</p>
                  )}
                </section>

                {/* Niches */}
                <section className="rounded-2xl border border-[rgba(30,41,59,0.08)] bg-white/85 p-6">
                  <h2 className="text-[17px] font-semibold text-slate-800">Niches</h2>
                  {publicInvestor.niches?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {publicInvestor.niches.map((n: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-xl bg-[rgba(10,102,194,0.10)] text-[rgba(10,102,194,1)] text-[13px] font-medium"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-[15px] text-slate-500 italic">No niches selected yet.</p>
                  )}
                </section>

                {/* Investments */}
                <section className="rounded-2xl border border-[rgba(30,41,59,0.08)] bg-white/85 p-6">
                  <h2 className="text-[17px] font-semibold text-slate-800">Investments</h2>
                  {publicInvestor.topInvestments?.length ? (
                    <div className="mt-3 flex flex-wrap gap-3 max-h-40 overflow-auto pr-1">
                      {publicInvestor.topInvestments
                        .filter((inv: any) => inv?.projectName && inv?.tokenCA)
                        .map((inv: any, i: number) => (
                          <a
                            key={`${inv.projectName}-${i}`}
                            href={solscanUrl(inv.tokenCA)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 border border-[rgba(30,41,59,0.10)] text-[14px] font-medium text-slate-900 shadow-[0_6px_14px_rgba(2,6,23,0.06)] hover:shadow-[0_10px_20px_rgba(2,6,23,0.08)] transition"
                            title={inv.tokenCA}
                          >
                            {inv.projectName}
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                          </a>
                        ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-[15px] text-slate-500 italic">No listed investments yet.</p>
                  )}
                </section>
              </div>

              {/* RIGHT: SIDEBAR */}
              <div className="col-span-12 md:col-span-5 space-y-8">
                {/* Preferences */}
                <section className="rounded-2xl border border-[rgba(30,41,59,0.08)] bg-white/85 p-6">
                  <h2 className="text-[17px] font-semibold text-slate-800">Preferences</h2>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {"onChainFocusPct" in (publicInvestor.prefs || {}) ? (
                      <div className="col-span-2 rounded-xl border border-[rgba(30,41,59,0.08)] bg-white/70 p-3 flex items-center justify-between">
                        <div>
                          <p className="text-[12.5px] text-slate-500">On-chain Focus</p>
                          <p className="text-[16px] font-medium text-slate-900">
                            {publicInvestor.prefs.onChainFocusPct}%
                          </p>
                        </div>
                        <div className="w-16 h-16">
                          <OnChainFocusChart onChainFocusPct={publicInvestor.prefs.onChainFocusPct} />
                        </div>
                      </div>
                    ) : null}

                    {"avgTicketSizeUsd" in (publicInvestor.prefs || {}) && publicInvestor.prefs.avgTicketSizeUsd ? (
                      <div className="rounded-xl border border-[rgba(30,41,59,0.08)] bg-white/70 p-3">
                        <p className="text-[12.5px] text-slate-500">Avg Ticket</p>
                        <p className="text-[15px] font-medium text-slate-900">
                          ${publicInvestor.prefs.avgTicketSizeUsd.toLocaleString()}
                        </p>
                      </div>
                    ) : null}

                    {"checksPerYear" in (publicInvestor.prefs || {}) ? (
                      <div className="rounded-xl border border-[rgba(30,41,59,0.08)] bg-white/70 p-3">
                        <p className="text-[12.5px] text-slate-500">Checks / Year</p>
                        <p className="text-[15px] font-medium text-slate-900">
                          {publicInvestor.prefs.checksPerYear}
                        </p>
                      </div>
                    ) : null}

                    {"stageFocus" in (publicInvestor.prefs || {}) && publicInvestor.prefs.stageFocus ? (
                      <div className="rounded-xl border border-[rgba(30,41,59,0.08)] bg-white/70 p-3 col-span-2">
                        <p className="text-[12.5px] text-slate-500">Stage Focus</p>
                        <p className="text-[15px] font-medium text-slate-900 capitalize">
                          {publicInvestor.prefs.stageFocus.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                      </div>
                    ) : null}

                    {"activityLevel" in (publicInvestor.prefs || {}) && publicInvestor.prefs.activityLevel ? (
                      <div className="rounded-xl border border-[rgba(30,41,59,0.08)] bg-white/70 p-3 col-span-2">
                        <p className="text-[12.5px] text-slate-500">Activity Level</p>
                        <p className="text-[15px] font-medium text-slate-900 capitalize">
                          {publicInvestor.prefs.activityLevel}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </section>

                {/* Contact */}
                <section className="rounded-2xl border border-[rgba(30,41,59,0.08)] bg-white/85 p-6">
                  <h2 className="text-[17px] font-semibold text-slate-800 mb-3">Contact</h2>
                  {publicInvestor.telegram ? (
                    <a
                      href={`https://t.me/${publicInvestor.telegram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[15px] text-[rgba(10,102,194,1)] hover:underline"
                    >
                      Telegram @{publicInvestor.telegram}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <div className="rounded-xl bg-[rgba(10,102,194,0.08)] border border-[rgba(10,102,194,0.14)] p-4">
                      <div className="flex items-center gap-2 text-slate-700 mb-2">
                        <Lock className="w-4 h-4" />
                        <span className="font-medium text-[15px]">Telegram locked</span>
                      </div>
                      <Button variant="primary" className="text-sm px-4 py-2">
                        Subscribe to Unlock
                      </Button>
                    </div>
                  )}
                </section>
              </div>
            </div>

            {/* FOOTER */}
            <div className="mt-8 pt-5 border-t border-[rgba(30,41,59,0.10)] flex items-center justify-between text-[13px] text-slate-500">
              <Link href="/investors" className="hover:underline">← Back to Investors</Link>
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
