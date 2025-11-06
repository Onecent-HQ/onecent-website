"use client";

import { useEffect, useState, useCallback, memo, useRef } from "react";
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
import WalletProvider from "@/components/WalletProvider";
import { useUser } from "@civic/auth/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { CheckCircle2, LogOut, ArrowLeft, XCircle, AlertCircle } from "lucide-react";
import { isAuthInProgress, setAuthInProgress, clearAuthLock } from "@/lib/authLock";

// Investments Section Component with Wallet Integration
const InvestmentsSection = memo(function InvestmentsSection({
  investments,
  onAdd,
  onUpdate,
  onRemove,
  onAddVerified,
}: {
  investments: TopInvestment[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof TopInvestment, value: string) => void;
  onRemove: (index: number) => void;
  onAddVerified: (mints: string[], metadata?: Record<string, { name?: string; symbol?: string; balance?: string; balanceRaw?: string; decimals?: number }>, walletMints?: Set<string>) => void;
}) {
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const [isFetching, setIsFetching] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Listen for wallet connection state changes and provide feedback
  useEffect(() => {
    if (wallet.connecting) {
      console.log("Wallet connecting...");
      setConnectionError(null);
    }
    
    if (wallet.connected && wallet.publicKey) {
      console.log("Wallet successfully connected:", wallet.publicKey.toString());
      setConnectionError(null);
    }
    
    // When wallet disconnects, clear notInWallet flags (can't verify without wallet)
    if (!wallet.connected) {
      // Reset notInWallet flags for all investments when wallet disconnects
      // This will be handled by the parent component if needed
    }
  }, [wallet.connecting, wallet.connected, wallet.publicKey]);

  const handleConnect = async () => {
    if (wallet.connected && wallet.publicKey) {
      try {
        await wallet.disconnect();
        setConnectionError(null);
      } catch (error) {
        console.error("Disconnect error:", error);
        setConnectionError("Failed to disconnect wallet");
      }
      return;
    }
    
    try {
      setConnectionError(null);
      // Open the modal - WalletModalProvider handles wallet selection and connection automatically
      // When user clicks a wallet in the modal, it should automatically select and connect
      setVisible(true);
    } catch (error) {
      console.error("Wallet connect error:", error);
      setConnectionError("Failed to open wallet selector. Please ensure a Solana wallet extension is installed.");
    }
  };

  const fetchWalletTokens = async () => {
    if (!wallet.publicKey) return;

    setIsFetching(true);
    try {
      const response = await fetch("/api/verify-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pubkey: wallet.publicKey.toString() }),
      });

      const data = await response.json();

      if (data.error && (!data.mints || data.mints.length === 0) && (!data.tokens || data.tokens.length === 0)) {
        // Error is non-blocking - user can still add manually
        return;
      }

      // Use tokens array if available (includes metadata), otherwise fall back to mints
      const tokens = data.tokens || (data.mints || []).map((mint: string) => ({ mint }));
      
      // Build metadata map from ALL tokens (including existing ones) for balance updates
      const allTokenMetadata: Record<string, { name?: string; symbol?: string; balance?: string; balanceRaw?: string; decimals?: number }> = {};
      
      tokens.forEach((token: any) => {
        if (typeof token !== 'string' && token.mint) {
          const mintLower = token.mint.toLowerCase();
          allTokenMetadata[mintLower] = {
            name: token.name,
            symbol: token.symbol,
            balance: token.balance,
            balanceRaw: token.balanceRaw,
            decimals: token.decimals,
          };
        }
      });

      // Debug: Log metadata to see what we're getting
      console.log("Token metadata received:", allTokenMetadata);

      // Get wallet mint addresses (case-insensitive set for comparison)
      const walletMints = new Set<string>(
        tokens.map((token: any): string =>
          (typeof token === 'string' ? token : token.mint).toLowerCase()
        )
      );

      // Add verified mints as investments (avoid duplicates)
      const existingCAs = new Set(
        investments.map((inv) => inv.tokenCA.toLowerCase())
      );
      
      const newTokens = tokens.filter(
        (token: any) => {
          const mint = typeof token === 'string' ? token : token.mint;
          return !existingCAs.has(mint.toLowerCase());
        }
      );

      if (newTokens.length > 0) {
        // Extract mint addresses, preserving metadata if available
        const mints = newTokens.map((token: any) => 
          typeof token === 'string' ? token : token.mint
        );
        
        console.log("Adding new tokens with metadata:", mints, allTokenMetadata);
        onAddVerified(mints, allTokenMetadata, walletMints);
      } else {
        // Even if no new tokens to add, verify existing manual tokens against wallet and update balances/names
        console.log("Updating existing tokens with metadata:", allTokenMetadata);
        onAddVerified([], allTokenMetadata, walletMints);
      }
    } catch (err) {
      console.error("Error fetching tokens:", err);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="py-8">
      <FieldGroup
        title="Investments"
        description="Connect your wallet to auto-detect tokens or add them manually."
      >
        {/* Wallet Connect Section - Premium */}
        <div className="mb-8 pb-8 border-b border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-white/90 mb-1.5">
                {wallet.connected && wallet.publicKey
                  ? `Connected: ${wallet.publicKey.toString().slice(0, 8)}...${wallet.publicKey.toString().slice(-8)}`
                  : "Connect your Solana wallet to auto-detect tokens"}
              </p>
              {connectionError && (
                <p className="text-xs text-red-400 mt-2">{connectionError}</p>
              )}
            </div>
            <div className="flex gap-3">
              <div className="[&_button]:!text-sm [&_button]:!px-5 [&_button]:!py-2.5 [&_button]:!rounded-lg">
                <WalletMultiButton />
              </div>
              {wallet.connected && wallet.publicKey && (
                <button
                  type="button"
                  onClick={fetchWalletTokens}
                  disabled={isFetching}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isFetching ? "Fetching..." : "Fetch Tokens"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Investments Table - Premium Format */}
        {investments.length > 0 && (
          <div className="mb-8">
            <div className="overflow-hidden rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Token Address</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Holdings</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-white/60 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {investments.map((investment, index) => (
                    <tr key={index} className="hover:bg-white/10 transition-colors group">
                      <td className="px-6 py-5">
                        <input
                          type="text"
                          value={investment.projectName}
                          onChange={(e) => onUpdate(index, "projectName", e.target.value)}
                          placeholder="Project name"
                          className="w-full px-3 py-2 text-sm text-white bg-transparent border border-transparent rounded-md hover:border-orange-500/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all placeholder:text-white/40"
                          required
                        />
                      </td>
                      <td className="px-6 py-5">
                        <input
                          type="text"
                          value={investment.tokenCA}
                          onChange={(e) => onUpdate(index, "tokenCA", e.target.value.trim())}
                          placeholder="Token address"
                          className="w-full px-3 py-2 text-sm font-mono text-white bg-transparent border border-transparent rounded-md hover:border-orange-500/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all placeholder:text-white/40"
                          required
                        />
                      </td>
                      <td className="px-6 py-5">
                        {investment.verified && investment.balance ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-white">
                              {parseFloat(investment.balance).toLocaleString(undefined, {
                                maximumFractionDigits: investment.decimals || 6,
                                minimumFractionDigits: 0,
                              })}
                            </span>
                            {investment.projectName && (
                              <span className="text-xs text-white/60">
                                {investment.projectName}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-white/40">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        {investment.verified ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        ) : investment.notInWallet && wallet.connected ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                            <XCircle className="w-3.5 h-3.5" />
                            Not in wallet
                          </span>
                        ) : investment.tokenCA ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 text-white/70 border border-white/20">
                            Unverified
                          </span>
                        ) : (
                          <span className="text-sm text-white/40">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={() => onRemove(index)}
                          className="text-sm text-red-400 hover:text-orange-500 font-medium px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Warning for unverified tokens */}
            {investments.some(inv => inv.notInWallet && wallet.connected) && (
              <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-400 leading-relaxed">
                    Some tokens aren&apos;t found in your connected wallet. Please verify the contract addresses.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Investment Button */}
        <div>
          <button
            type="button"
            onClick={onAdd}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-orange-500 bg-white/5 hover:bg-white/10 border border-white/20 transition-colors"
          >
            + Add Investment
          </button>
          {investments.length === 0 && (
            <p className="text-sm text-white/60 mt-3 ml-1">
              Tip: Highlight up to three top investments for fastest review.
            </p>
          )}
        </div>
      </FieldGroup>
    </div>
  );
});

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
  verified?: boolean; // true if fetched from wallet
  notInWallet?: boolean; // true if manually added but not found in connected wallet
  balance?: string; // Token holdings balance (if from wallet)
  balanceRaw?: string; // Raw balance string
  decimals?: number; // Token decimals
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
  const formRef = useRef<HTMLFormElement>(null);
  
  // CRITICAL: Prevent any auth checks if auth is already in progress
  // This stops the OAuth popup loop
  const skipAuthCheckRef = useRef(false);
  
  const { user, isLoading: authLoading, signOut } = useUser({
    onSignIn: () => {
      clearAuthLock();
      skipAuthCheckRef.current = false;
    },
  });

  const handleLogout = async () => {
    try {
      console.log("Starting logout...");
      clearAuthLock(); // Clear any auth locks
      
      // Call signOut hook
      if (signOut) {
        try {
          await signOut();
          console.log("SignOut hook completed");
        } catch (signOutError) {
          console.error("signOut() error:", signOutError);
        }
      }
      
      // Manually clear all Civic Auth storage
      try {
        // Clear localStorage
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('civic') || key.startsWith('auth') || key.includes('civic')) {
            localStorage.removeItem(key);
          }
        });
        
        // Clear sessionStorage
        const sessionKeys = Object.keys(sessionStorage);
        sessionKeys.forEach(key => {
          if (key.startsWith('civic') || key.startsWith('auth') || key.includes('civic')) {
            sessionStorage.removeItem(key);
          }
        });
        
        // Clear all cookies
        document.cookie.split(";").forEach(c => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
          if (name.includes('civic') || name.includes('auth') || name.includes('session')) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          }
        });
      } catch (storageError) {
        console.warn("Error clearing storage:", storageError);
      }
      
      // Force full page reload - this should clear everything
      window.location.replace("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Force redirect even on error - clear everything
      clearAuthLock();
      window.location.replace("/");
    }
  };
  
  // CRITICAL: If auth is in progress, immediately stop checking and wait
  useEffect(() => {
    if (isAuthInProgress()) {
      skipAuthCheckRef.current = true;
      // Let middleware handle the redirect - don't interfere
      return;
    }
    
    // If we have a user, clear any locks
    if (user) {
      clearAuthLock();
      skipAuthCheckRef.current = false;
    }
    
    // If auth finished loading with no user, let middleware redirect
    // Don't trigger any more auth checks
    if (!authLoading && !user) {
      skipAuthCheckRef.current = true;
    }
  }, [authLoading, user]);
  
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

  // Use refs to prevent multiple executions without causing re-renders
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // CRITICAL: Prevent multiple executions - use ref to track if already processed
    if (hasFetchedRef.current) return;
    
    // Wait for auth to finish loading - don't proceed until we know auth state
    if (authLoading === true || authLoading === undefined) return;
    
    // If no user and auth finished loading, middleware should have redirected
    // Don't do anything here - just wait for redirect or show error
    if (user === null || user === undefined) {
      // Don't redirect manually - middleware handles it to prevent OAuth loops
      return;
    }
    
    // User exists and auth loaded - fetch profile ONCE
    if (user && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
    fetchProfile();
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]); // Only depend on user and authLoading

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
      // Remove verified, notInWallet, balance, balanceRaw, and decimals flags from investments before submission (UI-only fields)
      const submitData = {
        ...formData,
        topInvestments: (formData.topInvestments || []).map(({ verified, notInWallet, balance, balanceRaw, decimals, ...inv }) => inv),
      };

      const response = await fetch("/api/investor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save profile");

      setToast({ message: "Profile saved successfully", type: "success" });
      
      // Refresh the investors list page if we're navigating away
      // Also refresh current page to get updated data
      router.refresh();
      
      // Small delay then redirect to investors page to see the profile
      setTimeout(() => {
        router.push("/investors");
      }, 1000);
    } catch (error: any) {
      setToast({ message: error.message || "Failed to save profile", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const addInvestment = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      topInvestments: [...(prev.topInvestments || []), { projectName: "", tokenCA: "" }],
    }));
  }, []);

  const updateInvestment = useCallback((index: number, field: keyof TopInvestment, value: string) => {
    setFormData((prev) => {
      const investments = [...(prev.topInvestments || [])];
      investments[index] = { ...investments[index], [field]: value };
      return { ...prev, topInvestments: investments };
    });
  }, []);

  const removeInvestment = useCallback((index: number) => {
    setFormData((prev) => {
      const investments = [...(prev.topInvestments || [])];
      investments.splice(index, 1);
      return { ...prev, topInvestments: investments };
    });
  }, []);

  const handleAddVerified = useCallback((mints: string[], metadata?: Record<string, { name?: string; symbol?: string; balance?: string; balanceRaw?: string; decimals?: number }>, walletMints?: Set<string>) => {
    setFormData((prev) => {
      const currentInvestments = [...(prev.topInvestments || [])];
      
      console.log("handleAddVerified called with:", { mints, metadata, walletMints });
      
      // Add new verified tokens from wallet
      if (mints.length > 0) {
        const newInvestments = mints.map((mint) => {
          // Use metadata if available, otherwise leave projectName empty for user to fill
          const tokenInfo = metadata?.[mint.toLowerCase()];
          const projectName = tokenInfo?.name || tokenInfo?.symbol || "";
          
          console.log(`Token ${mint}:`, { tokenInfo, projectName });
          
          return {
            projectName,
            tokenCA: mint,
            verified: true,
            notInWallet: false,
            balance: tokenInfo?.balance, // Include holdings balance
            balanceRaw: tokenInfo?.balanceRaw,
            decimals: tokenInfo?.decimals,
          };
        });
        currentInvestments.push(...newInvestments);
      }
      
      // Update ALL existing investments with metadata (names, balances, etc.)
      if (metadata) {
        currentInvestments.forEach((inv, index) => {
          if (inv.tokenCA) {
            const tokenInfo = metadata[inv.tokenCA.toLowerCase()];
            
            if (tokenInfo) {
              // Always update projectName from metadata if available (prefer name, fallback to symbol)
              const newProjectName = tokenInfo.name || tokenInfo.symbol || inv.projectName || "";
              
              // Update verification status if wallet is connected
              if (walletMints && walletMints.size > 0) {
                const isInWallet = walletMints.has(inv.tokenCA.toLowerCase());
                
                currentInvestments[index] = {
                  ...inv,
                  projectName: newProjectName,
                  verified: isInWallet || inv.verified,
                  notInWallet: !isInWallet && walletMints.size > 0,
                  balance: tokenInfo.balance || inv.balance,
                  balanceRaw: tokenInfo.balanceRaw || inv.balanceRaw,
                  decimals: tokenInfo.decimals || inv.decimals,
                };
              } else {
                // Just update name and balance, keep verification status
                currentInvestments[index] = {
                  ...inv,
                  projectName: newProjectName,
                  balance: tokenInfo.balance || inv.balance,
                  balanceRaw: tokenInfo.balanceRaw || inv.balanceRaw,
                  decimals: tokenInfo.decimals || inv.decimals,
                };
              }
            }
          }
        });
      }
      
      // Verify existing manually added tokens against wallet mints
      if (walletMints && walletMints.size > 0) {
        currentInvestments.forEach((inv, index) => {
          if (inv.tokenCA && !inv.verified) {
            // Manually added token - check if it's in wallet
            const isInWallet = walletMints.has(inv.tokenCA.toLowerCase());
            const tokenInfo = metadata?.[inv.tokenCA.toLowerCase()];
            
            currentInvestments[index] = {
              ...inv,
              verified: isInWallet,
              notInWallet: !isInWallet,
              // Update projectName from metadata if available
              projectName: tokenInfo?.name || tokenInfo?.symbol || inv.projectName || "",
              balance: tokenInfo?.balance || inv.balance,
              balanceRaw: tokenInfo?.balanceRaw || inv.balanceRaw,
              decimals: tokenInfo?.decimals || inv.decimals,
            };
          }
        });
      }
      
      return {
        ...prev,
        topInvestments: currentInvestments,
      };
    });
    
    if (mints.length > 0) {
      setToast({
        message: `Added ${mints.length} token${mints.length === 1 ? "" : "s"} from your wallet.${Object.keys(metadata || {}).length > 0 ? " Token names auto-filled." : " Please add project names."}`,
        type: "success",
      });
    }
  }, []);


  // CRITICAL: If auth is in progress (OAuth popup open), show loading and DO NOTHING
  // This prevents triggering more OAuth flows
  if (isAuthInProgress() || skipAuthCheckRef.current) {
    return (
      <div
        className="min-h-screen grid place-items-center"
        style={{
          background:
            "radial-gradient(1200px 500px at 10% -10%, rgba(10,102,194,0.12), transparent 60%), radial-gradient(900px 420px at 90% 0%, rgba(10,102,194,0.10), transparent 55%), linear-gradient(180deg, #F8FAFF, #F3F7FF)",
        }}
      >
        <div className="text-center space-y-3">
          <div className="animate-pulse text-sm text-gray-600 tracking-wide">
            {isAuthInProgress() ? "Completing sign-in..." : "Checking authentication..."}
          </div>
          <div className="text-xs text-gray-500">
            If this takes too long, <a href="/signin" className="text-accent underline">go to sign in page</a>
          </div>
        </div>
      </div>
    );
  }
  
  // Only show loading if auth is actively checking AND no user exists
  // If user exists, allow page to render (even if authLoading is true)
  if (authLoading && !user) {
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

  // If auth finished loading and no user, middleware should redirect
  // Show minimal loading to allow middleware to handle redirect
  if (!authLoading && !user) {
    return (
      <div
        className="min-h-screen grid place-items-center"
        style={{
          background:
            "radial-gradient(1200px 500px at 10% -10%, rgba(10,102,194,0.12), transparent 60%), radial-gradient(900px 420px at 90% 0%, rgba(10,102,194,0.10), transparent 55%), linear-gradient(180deg, #F8FAFF, #F3F7FF)",
        }}
      >
        <div className="text-center space-y-3">
          <div className="animate-pulse text-sm text-gray-600 tracking-wide">Redirecting to sign in...</div>
          <div className="text-xs text-gray-500">
            <a href="/signin" className="text-accent underline">Click here if redirect doesn&apos;t work</a>
          </div>
        </div>
      </div>
    );
  }
  
  // Show loading only for profile fetch, not auth
  // CRITICAL: If user exists but profile is loading, show loading but don't block redirect
  if (isLoading && user) {
  return (
    <div
        className="min-h-screen grid place-items-center"
      style={{
        background:
          "radial-gradient(1200px 500px at 10% -10%, rgba(10,102,194,0.12), transparent 60%), radial-gradient(900px 420px at 90% 0%, rgba(10,102,194,0.10), transparent 55%), linear-gradient(180deg, #F8FAFF, #F3F7FF)",
      }}
    >
        <div className="animate-pulse text-sm text-gray-600 tracking-wide">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Navigation Bar - Top */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#1a1a1a]/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-orange-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
              <Link
                href="/investors"
                className="inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-orange-500 transition-colors"
              >
                Browse Investors
              </Link>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-orange-500 bg-white/5 hover:bg-white/10 border border-white/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mx-auto max-w-4xl px-4 md:px-6 pt-24 pb-8">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white">
              Your Profile
            </h1>
            <p className="text-base text-white/70 leading-relaxed">
              Create and manage your investor profile
            </p>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-4xl px-4 md:px-6 mt-8 pb-32">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-12">
          {/* Identity */}
          <div className="py-8">
            <FieldGroup title="Identity" description="Tell us who you are. Keep it concise and specific.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
              <div className="mt-6">
                <Textarea
                  label="Bio / Description"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Share your focus, track record, and what you're looking for next"
                  maxLength={1000}
                  className="min-h-[140px]"
                />
                <div className="mt-2 text-xs text-white/50 text-right">
                  {(formData.bio?.length || 0)}/1000
                </div>
              </div>
            </FieldGroup>
          </div>

          {/* Contacts */}
          <div className="py-8 border-t border-white/10">
            <FieldGroup title="Contacts" description="Your public X handle and a gated Telegram handle.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
              <p className="text-sm text-white/60 mt-4 leading-relaxed">
                Your Telegram handle will not be public by default. A small subscription fee is required for users to contact you; it is risk-free.
              </p>
            </FieldGroup>
          </div>

          {/* Niches */}
          <div className="py-8 border-t border-white/10">
            <FieldGroup title="Niches / Fields" description="Select your core interests. Add others if needed.">
              <div className="mt-6">
              <MultiSelect
                options={NICHE_OPTIONS}
                value={formData.niches || []}
                onChange={(niches) => setFormData({ ...formData, niches })}
                allowOther
                maxSelections={6}
                label="Select your investment niches"
              />
              </div>
            </FieldGroup>
          </div>

          {/* Investments */}
          <WalletProvider>
            <InvestmentsSection
              investments={formData.topInvestments || []}
              onAdd={addInvestment}
              onUpdate={updateInvestment}
              onRemove={removeInvestment}
              onAddVerified={handleAddVerified}
            />
          </WalletProvider>

          {/* Preferences */}
          <div className="py-8 border-t border-white/10">
            <FieldGroup title="Investment Preferences" description="Sliders and selectors to make this fast.">
              <div className="space-y-10 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    className="w-5 h-5 text-orange-500 border-white/30 rounded focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-0 cursor-pointer bg-transparent"
                  />
                  <label htmlFor="coldPitches" className="text-sm font-medium text-white/90 cursor-pointer">
                    Open to cold pitches
                  </label>
                </div>
              </div>
            </FieldGroup>
          </div>
        </form>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#1a1a1a]/95 backdrop-blur-sm shadow-lg">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push("/investors")}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-orange-500 bg-white/5 hover:bg-white/10 border border-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (formRef.current) {
                  formRef.current.requestSubmit();
                }
              }}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Profile"
              )}
            </button>
          </div>
        </div>
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
