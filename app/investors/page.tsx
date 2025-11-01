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
const partnerBrands = [
  "Atlas Capital",
  "Lumen Partners",
  "Orion Ventures",
  "Helios Labs",
];

function DummyLogo() {
  return (
    <div className="inline-flex items-center gap-3 rounded-2xl border border-white/40 bg-white/70 px-4 py-2 shadow-lg backdrop-blur">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgba(10,102,194,1)] to-[rgba(10,102,194,0.6)] text-lg font-semibold text-white shadow-inner">
        SS
      </div>
      <div className="text-left">
        <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">
          Supershares
        </p>
        <p className="text-sm font-semibold text-slate-700">Investor Registry</p>
      </div>
    </div>
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
      helper: "ready for co-investment",
    },
    {
      label: "Verified on X",
      value: verifiedCount.toLocaleString(),
      helper: "identity confirmed",
    },
    {
      label: "Active niches",
      value: uniqueNichesCount.toLocaleString(),
      helper: "specialist verticals",
    },
  ];

  return (
    <div
      className="relative min-h-screen overflow-hidden text-ss.text"
      style={{
        background: "linear-gradient(180deg,#F8FBFF 0%,#EEF3FF 45%,#FCFDFF 100%)",
      }}
    >
      <div className="pointer-events-none absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(10,102,194,0.16),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -right-32 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(10,102,194,0.15),transparent_70%)] blur-3xl" />

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-4 md:px-6 pt-24 pb-16">
        <GlassCard className="relative overflow-hidden border border-white/60 bg-white/75 md:p-12 p-8 shadow-[0_35px_120px_-45px_rgba(15,23,42,0.65)]">
          <div className="pointer-events-none absolute inset-x-10 -top-20 h-32 rounded-full bg-gradient-to-r from-transparent via-white/50 to-transparent blur-3xl" />
          <div className="relative z-10 flex flex-col items-center gap-6 text-center">
            <DummyLogo />

            <h1 className="text-[40px] md:text-[56px] font-semibold tracking-tight flex items-baseline justify-center gap-3">
              <span className="text-[rgba(10,102,194,1)]">Super</span>
              <RotatingText
                words={rotatingWords}
                className="text-[rgba(10,102,194,0.75)] font-semibold"
                interval={2400}
              />
            </h1>
            <p className="max-w-3xl text-[16px] md:text-[18px] leading-relaxed text-slate-600">
              The curated home for capital allocators with conviction. Discover and connect
              with investors building the future of on-chain finance.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href={user ? "/account" : "/signin"}>
                <Button className="px-6 py-3 text-[15px] shadow-[0_20px_40px_-20px_rgba(10,102,194,0.6)]">
                  Become an Investor
                </Button>
              </Link>
              <Link
                href="#registry"
                className="inline-flex items-center gap-2 rounded-2xl border border-[rgba(10,102,194,0.25)] bg-white/80 px-6 py-3 text-[15px] font-medium text-[rgba(10,102,194,1)] shadow-sm transition hover:border-[rgba(10,102,194,0.35)] hover:bg-white"
              >
                Explore the registry
              </Link>
            </div>

            <div className="mt-10 grid w-full gap-4 md:grid-cols-3">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-white/70 bg-white/85 px-6 py-5 text-left shadow-[0_18px_45px_-30px_rgba(15,23,42,0.8)] backdrop-blur"
                >
                  <p className="text-3xl font-semibold text-slate-900">
                    {metric.value}
                  </p>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{metric.helper}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 w-full">
              <p className="text-xs uppercase tracking-[0.45em] text-slate-400">Trusted by operators from</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-slate-500">
                {partnerBrands.map((brand) => (
                  <span
                    key={brand}
                    className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 shadow-sm"
                  >
                    <span className="h-2 w-2 rounded-full bg-[rgba(10,102,194,0.6)]" />
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Search + Registry */}
      <section id="registry" className="relative max-w-7xl mx-auto px-4 md:px-6 pb-24">
        <GlassCard className="flex flex-col gap-6 border border-white/60 bg-white/85 md:flex-row md:items-center md:justify-between md:p-8 p-6 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.6)]">
          <div>
            <h2 className="text-[24px] font-semibold text-slate-900">Browse Investors</h2>
            <p className="text-sm text-slate-500">
              Filter the registry to uncover partners aligned with your thesis.
            </p>
          </div>
          <div className="w-full md:w-[360px]">
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
                className="pl-12 shadow-inner"
              />
            </div>
          </div>
        </GlassCard>

        <div className="mt-12">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-[0_20px_55px_-45px_rgba(15,23,42,1)] backdrop-blur animate-pulse"
                >
                  <div className="h-6 w-2/3 rounded-full bg-slate-200/70" />
                  <div className="mt-4 h-4 w-3/4 rounded-full bg-slate-200/60" />
                  <div className="mt-6 flex gap-3">
                    <div className="h-6 w-20 rounded-full bg-slate-200/60" />
                    <div className="h-6 w-24 rounded-full bg-slate-200/50" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <GlassCard className="border border-red-100 bg-red-50/70 text-center text-red-600 shadow-[0_25px_60px_-45px_rgba(248,113,113,0.6)]">
              <h3 className="text-lg font-semibold">We couldn’t load the registry.</h3>
              <p className="mt-2 text-sm text-red-500">
                {error} — verify your database connection in <code className="font-mono">.env.local</code>.
              </p>
            </GlassCard>
          ) : cleaned.length === 0 ? (
            <GlassCard className="border border-white/70 bg-white/80 text-center shadow-[0_30px_80px_-50px_rgba(15,23,42,0.5)]">
              <h3 className="text-2xl font-semibold text-slate-900">Be the signal.</h3>
              <p className="mt-3 text-sm text-slate-500">
                The first wave of profiles sets the tone for the network. List your profile to
                join the founding cohort.
              </p>
              <div className="mt-6 flex justify-center">
                <Link href={user ? "/account" : "/signin"}>
                  <Button className="px-6 py-2.5">Create your profile</Button>
                </Link>
              </div>
            </GlassCard>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {cleaned.map((investor) => (
                  <Link
                    key={investor.slug}
                    href={`/profile/${investor.slug}`}
                    className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(10,102,194,0.35)]"
                  >
                    <div className="relative rounded-3xl border border-white/60 bg-white/80 p-1 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.5)] transition-transform duration-200 group-hover:-translate-y-1">
                      <div className="rounded-[1.5rem] bg-gradient-to-br from-white via-white/90 to-white/60">
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
                    </div>
                  </Link>
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-full border border-white/70 bg-white/80 px-5 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="rounded-full border border-white/60 bg-white/90 px-5 py-2 text-sm font-medium text-slate-500 shadow-inner">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="rounded-full border border-white/70 bg-white/80 px-5 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
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
