"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ProfileCard from "@/components/ProfileCard";
import Input from "@/components/Input";
import { Search, ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import Button from "@/components/Button";
import Navbar from "@/components/Navbar";
import { useUser } from "@civic/auth/react";

interface Investor {
  _id: string;
  slug: string;
  name: string;
  headline?: string;
  niches?: string[];
  xHandle?: string;
  verified?: boolean;
  profileImage?: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

function InvestorsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const fetchInvestors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", page.toString());

      const response = await fetch(`/api/investors?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch investors");
      }

      setInvestors(data.investors || []);
      setPagination(data.pagination || null);
    } catch (err: any) {
      console.error("Error fetching investors:", err);
      setError(err.message || "Failed to load investors");
      setInvestors([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchInvestors();
  }, [fetchInvestors]);

  // Check if user is new and show welcome banner
  useEffect(() => {
    const checkNewUser = async () => {
      if (!user) {
        setShowWelcomeBanner(false);
        setIsNewUser(false);
        return;
      }

      // Check if user has dismissed the banner
      const dismissedKey = `welcome-banner-dismissed-${user.id || 'default'}`;
      const dismissed = typeof window !== 'undefined' && localStorage.getItem(dismissedKey) === 'true';
      
      if (dismissed) {
        setShowWelcomeBanner(false);
        return;
      }

      // Fetch user profile to check if they're new
      try {
        const response = await fetch("/api/me", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          if (data.investor) {
            const investor = data.investor;
            
            // Check if profile was just created (createdAt === updatedAt or within 5 seconds)
            let isNewUser = false;
            if (investor.createdAt && investor.updatedAt) {
              const createdAt = new Date(investor.createdAt).getTime();
              const updatedAt = new Date(investor.updatedAt).getTime();
              const timeDiff = Math.abs(updatedAt - createdAt);
              if (timeDiff < 5000) {
                isNewUser = true;
              }
            }
            
            // Check if profile has minimal/default data
            if (!isNewUser) {
              const hasMinimalData = 
                !investor.bio && 
                !investor.headline && 
                (!investor.topInvestments || investor.topInvestments.length === 0) &&
                (!investor.niches || investor.niches.length === 0) &&
                !investor.profileImage;
              isNewUser = hasMinimalData;
            }
            
            setIsNewUser(isNewUser);
            setShowWelcomeBanner(isNewUser);
          } else {
            // No profile exists - definitely a new user
            setIsNewUser(true);
            setShowWelcomeBanner(true);
          }
        }
      } catch (error) {
        console.error("Error checking user profile:", error);
        setShowWelcomeBanner(false);
        setIsNewUser(false);
      }
    };

    checkNewUser();
  }, [user]);

  const handleDismissWelcomeBanner = () => {
    const dismissedKey = `welcome-banner-dismissed-${user?.id || 'default'}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(dismissedKey, 'true');
    }
    setShowWelcomeBanner(false);
  };

  // Update URL when search or page changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (page > 1) params.set("page", page.toString());
    router.replace(`/investors?${params.toString()}`, { scroll: false });
  }, [search, page, router]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Welcome Banner for New Users */}
      {showWelcomeBanner && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-4">
          <div className="relative p-5 rounded-xl bg-white/5 border border-white/20 backdrop-blur-sm">
            <button
              onClick={handleDismissWelcomeBanner}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3 pr-10">
              <Sparkles className="w-5 h-5 text-white/80 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-base font-semibold text-white mb-1">
                  Hey! We see you&apos;re new here
                </h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Let&apos;s create your profile! Click &quot;Create Your Profile&quot; to get started and showcase your investment focus.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <Navbar variant="investors" isNewUser={isNewUser} />

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-28 pb-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Investor <span className="text-white">Leaderboard</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl">
            Discover partners aligned with your investment thesis
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name or niche..."
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="mt-4 text-white/60">Loading investors...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-white mb-4">{error}</p>
            <Button onClick={fetchInvestors} variant="secondary">
              Try Again
            </Button>
          </div>
        ) : investors.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/60 text-lg">
              {search ? "No investors found matching your search." : "No investors found."}
            </p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            {pagination && (
              <div className="mb-6 text-white/60">
                Showing {((page - 1) * pagination.pageSize) + 1} - {Math.min(page * pagination.pageSize, pagination.total)} of {pagination.total} investors
              </div>
            )}

            {/* Investor Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {investors.map((investor) => (
                <Link key={investor._id} href={`/profile/${investor.slug}`}>
                  <ProfileCard
                    name={investor.name}
                    title={investor.headline}
                    handle={investor.xHandle}
                    verified={investor.verified}
                    niches={investor.niches}
                    avatarUrl={investor.profileImage}
                    status={investor.verified ? "Verified" : "Unverified"}
                    showUserInfo={true}
                    enableTilt={true}
                    enableMobileTilt={false}
                  />
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      // Show first page, last page, current page, and pages around current
                      return (
                        p === 1 ||
                        p === pagination.totalPages ||
                        (p >= page - 1 && p <= page + 1)
                      );
                    })
                    .map((p, idx, arr) => {
                      // Add ellipsis if there's a gap
                      const showEllipsisBefore = idx > 0 && arr[idx - 1] < p - 1;
                      return (
                        <div key={p} className="flex items-center gap-2">
                          {showEllipsisBefore && (
                            <span className="text-white/40">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(p)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              p === page
                                ? "bg-black text-white border border-white/50"
                                : "text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/50"
                            }`}
                          >
                            {p}
                          </button>
                        </div>
                      );
                    })}
                </div>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function InvestorsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="mt-4 text-white/60">Loading...</p>
        </div>
      </div>
    }>
      <InvestorsListContent />
    </Suspense>
  );
}
