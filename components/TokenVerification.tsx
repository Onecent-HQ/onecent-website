"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { ChevronDown, ChevronUp, X, AlertCircle, CheckCircle2 } from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import FieldGroup from "@/components/FieldGroup";

interface TokenEntry {
  mint: string;
  verified: boolean;
  tokenCount?: string;
}

export default function TokenVerification() {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState<TokenEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [manualMint, setManualMint] = useState("");
  const [manualCount, setManualCount] = useState("");

  const handleConnect = useCallback(async () => {
    if (connected && publicKey) {
      disconnect();
      setTokens([]);
      setError(null);
      return;
    }
    setVisible(true);
  }, [connected, publicKey, disconnect, setVisible]);

  const fetchWalletTokens = useCallback(async () => {
    if (!publicKey) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/verify-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pubkey: publicKey.toString() }),
      });

      const data = await response.json();

      if (data.error && data.mints.length === 0) {
        setError(data.error);
        return;
      }

      // Add verified mints to the list (deduplicate)
      const newMints = data.mints.map((mint: string) => ({
        mint,
        verified: true,
      }));

      setTokens((prev) => {
        const existingMints = new Set(prev.map((t) => t.mint));
        const uniqueNewMints = newMints.filter(
          (entry: TokenEntry) => !existingMints.has(entry.mint)
        );
        return [...prev, ...uniqueNewMints];
      });

      if (data.mints.length === 0) {
        setError("No devnet SPL tokens detected.");
      }
    } catch (err) {
      console.error("Error fetching tokens:", err);
      setError(
        "Couldn't fetch tokens right now. You can still submit the form or add a contract address manually."
      );
    } finally {
      setIsLoading(false);
    }
  }, [publicKey]);

  const addManualEntry = () => {
    const trimmedMint = manualMint.trim();
    if (!trimmedMint) return;

    // Basic validation: Solana address format (base58, 32-44 chars)
    if (trimmedMint.length < 32 || trimmedMint.length > 44) {
      setError("Invalid contract address format. Please enter a valid Solana mint address.");
      return;
    }

    // Check if mint already exists
    if (tokens.some((t) => t.mint.toLowerCase() === trimmedMint.toLowerCase())) {
      setError("This contract address is already in the list.");
      return;
    }

    setTokens((prev) => [
      ...prev,
      {
        mint: trimmedMint,
        verified: false,
        tokenCount: manualCount.trim() || undefined,
      },
    ]);

    setManualMint("");
    setManualCount("");
    setError(null);
  };

  const removeToken = (index: number) => {
    setTokens((prev) => prev.filter((_, i) => i !== index));
  };

  // Auto-fetch when wallet connects (removed auto-fetch to let user control)

  return (
    <div className="rounded-2xl border border-[rgba(10,102,194,0.16)] bg-white/70 backdrop-blur overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/50 transition-colors"
      >
        <div className="text-left">
          <h3 className="text-lg font-semibold text-slate-900">
            Investor Token Verification (Optional)
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            {tokens.length > 0
              ? `${tokens.length} token${tokens.length === 1 ? "" : "s"} added`
              : "Connect wallet or add contract addresses manually"}
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="p-5 pt-0 space-y-6 border-t border-slate-200/60">
          {/* Wallet Connect Block */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1">
                  Wallet Verification
                </h4>
                <p className="text-xs text-slate-600">
                  {connected && publicKey
                    ? `Connected: ${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
                    : "We detected the following token mints on your wallet (devnet)."}
                </p>
              </div>
              <Button
                type="button"
                variant={connected ? "secondary" : "primary"}
                onClick={handleConnect}
                className="text-sm px-4 py-2"
              >
                {connected ? "Wallet Connected" : "Connect Solana Wallet (devnet)"}
              </Button>
            </div>

            {connected && publicKey && !isLoading && tokens.filter((t) => t.verified).length === 0 && (
              <Button
                type="button"
                variant="secondary"
                onClick={fetchWalletTokens}
                className="w-full text-sm"
              >
                Fetch Tokens
              </Button>
            )}

            {isLoading && (
              <div className="text-sm text-slate-600 text-center py-2">
                Fetching tokens...
              </div>
            )}
          </div>

          {/* Manual Entry Block */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">
                Manual Entry
              </h4>
              <p className="text-xs text-slate-600">
                If you can&apos;t connect a wallet, add your token&apos;s contract address (mint).
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-3">
              <div className="space-y-2">
                <Input
                  label="Contract Address (mint)"
                  value={manualMint}
                  onChange={(e) => setManualMint(e.target.value)}
                  placeholder="Enter token contract address"
                  className="text-sm"
                />
                <Input
                  label="Number of tokens owned (optional)"
                  type="number"
                  value={manualCount}
                  onChange={(e) => setManualCount(e.target.value)}
                  placeholder="Optional quantity"
                  className="text-sm"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={addManualEntry}
                  className="text-sm px-4 py-2 whitespace-nowrap"
                  disabled={!manualMint.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-amber-200/80 bg-amber-50/70 p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">{error}</p>
            </div>
          )}

          {/* Token List */}
          {tokens.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-900">
                Token Mints ({tokens.length})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tokens.map((token, index) => (
                  <div
                    key={`${token.mint}-${index}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200/60 bg-white/80"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            token.verified
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {token.verified ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Verified via wallet
                            </>
                          ) : (
                            "Unverified (manual)"
                          )}
                        </span>
                        {token.tokenCount && (
                          <span className="text-xs text-slate-500">
                            Qty: {token.tokenCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-mono truncate">
                        {token.mint}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeToken(index)}
                      className="flex-shrink-0 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

