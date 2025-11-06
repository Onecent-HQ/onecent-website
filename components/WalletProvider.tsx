"use client";

import { useMemo, useCallback, ReactNode } from "react";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletProviderProps {
  children: ReactNode;
}

// Memoize endpoint to prevent re-creation
const getEndpoint = () => {
  const network = (process.env.NEXT_PUBLIC_SOLANA_CLUSTER as WalletAdapterNetwork) || WalletAdapterNetwork.Devnet;
  return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 
    (network === WalletAdapterNetwork.Devnet 
      ? "https://api.devnet.solana.com"
      : "https://api.mainnet-beta.solana.com");
};

const getNetwork = (): WalletAdapterNetwork => {
  return (process.env.NEXT_PUBLIC_SOLANA_CLUSTER as WalletAdapterNetwork) || WalletAdapterNetwork.Devnet;
};

export default function WalletProvider({ children }: WalletProviderProps) {
  const network = useMemo(() => getNetwork(), []);
  
  // Initialize wallet adapters with network - memoized to prevent re-initialization
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [network] // Include network in deps to recreate if network changes
  );

  // Memoize endpoint
  const endpoint = useMemo(() => getEndpoint(), []);

  // Error handler for wallet connection
  const onError = useCallback((error: Error) => {
    console.error("Wallet connection error:", error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect={false} onError={onError}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}

