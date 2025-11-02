"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import Input from "@/components/Input";
import Button from "@/components/Button";
import ProfileCard from "@/components/ProfileCard";
import RotatingText from "@/components/RotatingText";
import { Search } from "lucide-react";
import { useUser } from "@civic/auth/react";

interface Investor {
  slug: string;
  name: string;
  headline?: string;
  niches?: string[];
  xHandle?: string;
  verified?: boolean;
  updatedAt: string;
}

interface Pagination {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

const rotatingWords = ["Stacks", "Syndicates", "Signals"];

function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[rgba(10,102,194,1)] to-[rgba(10,102,194,0.75)] text-base font-semibold text-white shadow-[0_4px_12px_rgba(10,102,194,0.3)] transition-transform group-hover:scale-105">
        SS
      </div>
      <div className="text-left">
        <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-medium">
          Supershares
        </p>
        <p className="text-xs font-semibold text-slate-700 leading-tight">Registry</p>
      </div>
    </Link>
  );
}

export default function InvestorsPage() {
  const { user } = useUser();
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvestors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  async function fetchInvestors() {
    setIsLoading(true);
    setError(null);
    try {
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/investors?page=${page}${searchParam}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load investors");
      setInvestors(data.investors || []);
      setPagination(data.pagination || null);
    } catch (e: any) {
      setError(e.message || "Failed to load investors.");
      setInvestors([]);
    } finally {
      setIsLoading(false);
    }
  }

  const cleaned = useMemo(
    () =>
      (investors || []).filter(
        (i) => i && i.slug && i.name && i.name.toLowerCase() !== "unknown"
      ),
    [investors]
  );

  const totalInvestors = pagination?.total ?? cleaned.length;
  const verifiedCount = cleaned.reduce(
    (count, investor) => (investor.verified ? count + 1 : count),
    0
  );
  const uniqueNichesCount = (() => {
    const set = new Set<string>();
    cleaned.forEach((investor) => {
      investor.niches?.forEach((niche) => {
        if (niche) {
          set.add(niche);
        }
      });
    });
    return set.size;
  })();

  const metrics = [
    {
      label: "Investors listed",
      value: totalInvestors.toLocaleString(),
    },
    {
      label: "Verified on X",
      value: verifiedCount.toLocaleString(),
    },
    {
      label: "Active niches",
      value: uniqueNichesCount.toLocaleString(),
    },
  ];

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background: "linear-gradient(180deg,#FAFCFF 0%,#F1F6FF 50%,#FAFCFF 100%)",
      }}
    >
      {/* Ambient gradients */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(10,102,194,0.12),transparent_70%)] blur-3xl" />
        <div className="absolute top-1/2 -right-32 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_70%)] blur-3xl" />
      </div>

      {/* Logo - Top Left */}
      <div className="fixed top-6 left-6 z-50">
        <Logo />
      </div>

      {/* Hero Section - Minimal */}
      <section className="relative max-w-5xl mx-auto px-4 md:px-6 pt-32 pb-20">
        <div className="flex flex-col items-center text-center space-y-8">
          <h1 className="text-[42px] md:text-[64px] font-semibold tracking-tight leading-[1.1]">
            <span className="text-[rgba(10,102,194,1)]">Super</span>
            <RotatingText
              words={rotatingWords}
              className="text-[rgba(10,102,194,0.85)] font-semibold"
              interval={2400}
            />
          </h1>
          
          <p className="max-w-2xl text-[18px] md:text-[20px] leading-relaxed text-slate-700 font-light">
            Where capital meets conviction. The curated network for investors building
            <span className="font-medium text-slate-900"> the future of on-chain finance</span>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href={user ? "/account" : "/signin"}>
              <Button className="px-8 py-3 text-[15px] font-medium shadow-[0_16px_32px_-12px_rgba(10,102,194,0.4)]">
                Join the Network
              </Button>
            </Link>
            <Link
              href="#registry"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/60 px-6 py-3 text-[15px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white/80"
            >
              Explore Investors
            </Link>
          </div>

          {/* Subtle Metrics Bar */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-slate-200/50 w-full max-w-3xl">
            {metrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <p className="text-[28px] md:text-[32px] font-semibold text-slate-900 leading-none">
                  {metric.value}
                </p>
                <p className="mt-1.5 text-[11px] uppercase tracking-[0.25em] text-slate-500 font-medium">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search + Registry */}
      <section id="registry" className="relative max-w-7xl mx-auto px-4 md:px-6 pb-24">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h2 className="text-[28px] md:text-[32px] font-semibold text-slate-900 mb-2">Investor Registry</h2>
            <p className="text-[15px] text-slate-600 font-light">
              Discover partners aligned with your investment thesis
            </p>
          </div>
          <div className="w-full md:w-[380px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, handle, or niche"
                className="pl-12 bg-white/80 border-slate-200/80 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200/60 bg-white/60 p-6 backdrop-blur-sm animate-pulse"
                >
                  <div className="h-6 w-2/3 rounded-full bg-slate-200/60" />
                  <div className="mt-4 h-4 w-3/4 rounded-full bg-slate-200/40" />
                  <div className="mt-6 flex gap-2">
                    <div className="h-5 w-20 rounded-full bg-slate-200/40" />
                    <div className="h-5 w-24 rounded-full bg-slate-200/30" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100/80 bg-red-50/60 text-center p-8 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-red-700">We couldn&apos;t load the registry.</h3>
              <p className="mt-2 text-sm text-red-600/80">
                {error} — verify your database connection in <code className="font-mono text-red-700">.env.local</code>.
              </p>
            </div>
          ) : cleaned.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white/60 text-center p-12 backdrop-blur-sm">
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">Be the signal.</h3>
              <p className="text-[15px] text-slate-600 mb-6 font-light">
                The first wave of profiles sets the tone for the network. List your profile to
                join the founding cohort.
              </p>
              <Link href={user ? "/account" : "/signin"}>
                <Button className="px-6 py-2.5">Create your profile</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cleaned.map((investor) => (
                  <Link
                    key={investor.slug}
                    href={`/profile/${investor.slug}`}
                    className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(10,102,194,0.25)] rounded-2xl"
                  >
                    <div className="relative rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-sm p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-slate-300/80 group-hover:bg-white/90 group-hover:shadow-[0_20px_50px_-15px_rgba(15,23,42,0.15)]">
                      <ProfileCard
                        name={investor.name}
                        title={investor.headline}
                        handle={investor.xHandle}
                        status={investor.verified ? "Verified" : "Unverified"}
                        verified={investor.verified}
                        niches={investor.niches}
                        showUserInfo
                        enableTilt
                        enableMobileTilt={false}
                      />
                    </div>
                  </Link>
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-full border border-slate-200/80 bg-white/70 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-white hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/70"
                  >
                    Previous
                  </button>
                  <span className="rounded-full bg-slate-50/80 border border-slate-200/60 px-5 py-2 text-sm font-medium text-slate-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="rounded-full border border-slate-200/80 bg-white/70 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-white hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/70"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
