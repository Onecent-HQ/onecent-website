import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";

// SPL Token Program ID
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

// Metaplex Token Metadata Program ID (for fetching token names/symbols)
const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

// Helper function to derive metadata PDA
function deriveMetadataPDA(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
}

// Helper function to fetch on-chain token metadata
async function fetchOnChainMetadata(
  connection: Connection,
  mint: string
): Promise<{ name?: string; symbol?: string } | null> {
  try {
    const mintPubkey = new PublicKey(mint);
    const [metadataPDA] = deriveMetadataPDA(mintPubkey);
    
    const accountInfo = await connection.getAccountInfo(metadataPDA);
    if (!accountInfo) {
      return null;
    }

    // Parse metadata account
    // Structure: [key: u8(1), update_authority: Pubkey(32), mint: Pubkey(32), data: Data]
    // Data structure: [name: String, symbol: String, uri: String, seller_fee_basis_points: u16, creators: Option<Vec<Creator>>]
    const data = accountInfo.data;
    
    if (data.length < 100) {
      // Account too small to contain metadata
      return null;
    }
    
    // Skip key (1 byte), update_authority (32 bytes), mint (32 bytes)
    let offset = 1 + 32 + 32;
    
    // Read name: u32 length prefix + string
    if (offset + 4 > data.length) return null;
    const nameLength = data.readUInt32LE(offset);
    offset += 4;
    
    if (offset + nameLength > data.length) return null;
    const nameBytes = data.slice(offset, offset + nameLength);
    const name = nameBytes.toString('utf8').replace(/\0/g, '').trim();
    offset += nameLength;
    
    // Read symbol: u32 length prefix + string
    if (offset + 4 > data.length) return null;
    const symbolLength = data.readUInt32LE(offset);
    offset += 4;
    
    if (offset + symbolLength > data.length) return null;
    const symbolBytes = data.slice(offset, offset + symbolLength);
    const symbol = symbolBytes.toString('utf8').replace(/\0/g, '').trim();
    
    if (name || symbol) {
      return { 
        name: name || undefined, 
        symbol: symbol || undefined 
      };
    }
  } catch (error) {
    console.log(`Error parsing on-chain metadata for ${mint}:`, error);
  }
  return null;
}

interface TokenInfo {
  mint: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  balance?: string; // UI amount string (human-readable balance)
  balanceRaw?: string; // Raw amount string (with decimals)
}

export async function POST(request: NextRequest) {
  try {
    const { pubkey } = await request.json();

    if (!pubkey || typeof pubkey !== "string") {
      return NextResponse.json(
        { error: "Invalid public key" },
        { status: 400 }
      );
    }

    // Get RPC URL from environment (devnet by default)
    const cluster = process.env.SOLANA_CLUSTER || "devnet";
    const rpcUrl =
      process.env.SOLANA_RPC_URL ||
      (cluster === "devnet"
        ? "https://api.devnet.solana.com"
        : "https://api.mainnet-beta.solana.com");

    let publicKey: PublicKey;
    try {
      publicKey = new PublicKey(pubkey);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid public key format" },
        { status: 400 }
      );
    }

    // Connect to Solana
    const connection = new Connection(rpcUrl, "confirmed");

    // Get all token accounts for this owner with jsonParsed encoding
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      {
        programId: TOKEN_PROGRAM_ID,
      },
      "confirmed"
    );

    // Extract mint addresses with non-zero balances, token info, and holdings
    const mintMap = new Map<string, { 
      mint: string; 
      decimals?: number;
      balance: string; // UI amount string
      balanceRaw: string; // Raw amount string
    }>();

    for (const accountInfo of tokenAccounts.value) {
      try {
        const parsedInfo = accountInfo.account.data.parsed?.info;
        if (parsedInfo) {
          const mint = parsedInfo.mint;
          const tokenAmount = parsedInfo.tokenAmount;
          const decimals = tokenAmount?.decimals;
          const uiAmountString = tokenAmount?.uiAmountString || "0";
          const amount = tokenAmount?.amount || "0";

          // Only include mints with non-zero balances
          if (tokenAmount && parseFloat(uiAmountString) > 0 && mint) {
            const mintLower = mint.toLowerCase();
            
            if (mintMap.has(mintLower)) {
              // If mint already exists, sum up the balances (user might have multiple token accounts)
              const existing = mintMap.get(mintLower)!;
              const existingBalance = parseFloat(existing.balance) || 0;
              const newBalance = parseFloat(uiAmountString) || 0;
              const existingRaw = BigInt(existing.balanceRaw || "0");
              const newRaw = BigInt(amount || "0");
              
              mintMap.set(mintLower, {
                mint,
                decimals,
                balance: (existingBalance + newBalance).toFixed(decimals || 0),
                balanceRaw: (existingRaw + newRaw).toString(),
              });
            } else {
              mintMap.set(mintLower, {
                mint,
                decimals,
                balance: uiAmountString,
                balanceRaw: amount,
              });
            }
          }
        }
      } catch (error) {
        // Skip accounts that can't be parsed
        continue;
      }
    }

    const mints = Array.from(mintMap.values());

    // Fetch token metadata from multiple sources
    let tokenListMap = new Map<string, { name: string; symbol: string }>();
    
    // Step 1: Try Jupiter token list first (includes devnet tokens)
    try {
      const jupiterResponse = await fetch(
        `https://token.jup.ag/${cluster === "devnet" ? "devnet" : "strict"}`
      );
      if (jupiterResponse.ok) {
        const jupiterTokens = await jupiterResponse.json();
        let foundCount = 0;
        jupiterTokens.forEach((token: any) => {
          if (token.address && token.name && token.symbol) {
            tokenListMap.set(token.address.toLowerCase(), {
              name: token.name,
              symbol: token.symbol,
            });
            foundCount++;
          }
        });
        console.log(`Jupiter token list: Found ${foundCount} tokens with metadata`);
      }
    } catch (error) {
      console.log("Failed to fetch Jupiter token list, continuing without metadata");
    }

    // Step 2: Try Solana token list as fallback
    try {
      const solanaListResponse = await fetch(
        "https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json"
      );
      if (solanaListResponse.ok) {
        const solanaTokens = await solanaListResponse.json();
        solanaTokens.tokens?.forEach((token: any) => {
          if (token.address && token.name && token.symbol && !tokenListMap.has(token.address.toLowerCase())) {
            tokenListMap.set(token.address.toLowerCase(), {
              name: token.name,
              symbol: token.symbol,
            });
          }
        });
      }
    } catch (error) {
      console.log("Failed to fetch Solana token list, continuing without metadata");
    }

    // Step 3: Use Helius DAS API to fetch metadata for tokens not found in public lists
    const heliusApiKey = process.env.HELIUS_API_KEY;
    const missingMints = mints.filter((token) => !tokenListMap.has(token.mint.toLowerCase()));
    
    if (heliusApiKey && missingMints.length > 0 && cluster !== "devnet") {
      try {
        const heliusUrl = `https://devnet.helius-rpc.com/?api-key=${heliusApiKey}`;
        
        console.log(`Fetching metadata from Helius for ${missingMints.length} tokens`);
        
        // Fetch metadata for missing tokens in batches
        const batchSize = 10;
        for (let i = 0; i < missingMints.length; i += batchSize) {
          const batch = missingMints.slice(i, i + batchSize);
          
          const promises = batch.map(async (token) => {
            try {
              const response = await fetch(heliusUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  jsonrpc: "2.0",
                  id: `token-${token.mint}`,
                  method: "getAsset",
                  params: {
                    id: token.mint,
                  },
                }),
              });

              const data = await response.json();
              if (data.result) {
                const asset = data.result;
                const name = asset.content?.metadata?.name || asset.content?.metadata?.title;
                const symbol = asset.content?.metadata?.symbol;
                
                if (name || symbol) {
                  console.log(`Helius found metadata for ${token.mint}:`, { name, symbol });
                  return {
                    mint: token.mint.toLowerCase(),
                    name: name || symbol || "",
                    symbol: symbol || name?.substring(0, 6) || "",
                  };
                }
              }
            } catch (error) {
              console.log(`Failed to fetch Helius metadata for ${token.mint}:`, error);
            }
            return null;
          });

          const results = await Promise.all(promises);
          results.forEach((result) => {
            if (result) {
              tokenListMap.set(result.mint, {
                name: result.name,
                symbol: result.symbol,
              });
            }
          });
        }
      } catch (error) {
        console.log("Failed to fetch Helius metadata, continuing with available data:", error);
      }
    } else if (missingMints.length > 0) {
      console.log(`Skipping Helius fetch: ${missingMints.length} missing tokens, heliusApiKey=${!!heliusApiKey}, cluster=${cluster}`);
    }

    // Step 4: Try fetching on-chain metadata from Metaplex Token Metadata program
    const stillMissingMints = mints.filter((token) => !tokenListMap.has(token.mint.toLowerCase()));
    if (stillMissingMints.length > 0) {
      console.log(`Fetching on-chain metadata for ${stillMissingMints.length} tokens`);
      
      // Fetch metadata in batches to avoid rate limits
      const batchSize = 5;
      for (let i = 0; i < stillMissingMints.length; i += batchSize) {
        const batch = stillMissingMints.slice(i, i + batchSize);
        
        const promises = batch.map(async (token) => {
          try {
            const metadata = await fetchOnChainMetadata(connection, token.mint);
            if (metadata && (metadata.name || metadata.symbol)) {
              console.log(`On-chain metadata found for ${token.mint}:`, metadata);
              return {
                mint: token.mint.toLowerCase(),
                name: metadata.name || "",
                symbol: metadata.symbol || "",
              };
            }
          } catch (error) {
            console.log(`Failed to fetch on-chain metadata for ${token.mint}:`, error);
          }
          return null;
        });

        const results = await Promise.all(promises);
        results.forEach((result) => {
          if (result) {
            tokenListMap.set(result.mint, {
              name: result.name,
              symbol: result.symbol,
            });
          }
        });
      }
    }

    // Step 5: Try Birdeye API as additional fallback for mainnet (only for tokens still missing)
    const finalMissingMints = mints.filter((token) => !tokenListMap.has(token.mint.toLowerCase()));
    if (finalMissingMints.length > 0 && cluster !== "devnet") {
      const birdeyeApiKey = process.env.BIRDEYE_API_KEY;
      if (birdeyeApiKey) {
        try {
          // Fetch token info from Birdeye in batches
          const batchSize = 5;
          for (let i = 0; i < finalMissingMints.length; i += batchSize) {
            const batch = finalMissingMints.slice(i, i + batchSize);
            
            const promises = batch.map(async (token) => {
              try {
                const response = await fetch(
                  `https://public-api.birdeye.so/defi/token_overview?address=${token.mint}`,
                  {
                    headers: {
                      "X-API-KEY": birdeyeApiKey,
                    },
                  }
                );

                if (response.ok) {
                  const data = await response.json();
                  if (data.data?.name || data.data?.symbol) {
                    return {
                      mint: token.mint.toLowerCase(),
                      name: data.data.name || data.data.symbol || "",
                      symbol: data.data.symbol || data.data.name?.substring(0, 6) || "",
                    };
                  }
                }
              } catch (error) {
                // Silently continue
              }
              return null;
            });

            const results = await Promise.all(promises);
            results.forEach((result) => {
              if (result && !tokenListMap.has(result.mint)) {
                tokenListMap.set(result.mint, {
                  name: result.name,
                  symbol: result.symbol,
                });
              }
            });
          }
        } catch (error) {
          console.log("Failed to fetch Birdeye metadata, continuing with available data");
        }
      }
    }

    // Build token info with metadata from all sources and include holdings
    const tokensWithMetadata: TokenInfo[] = mints.map((token) => {
      const metadata = tokenListMap.get(token.mint.toLowerCase());
      const result = {
        mint: token.mint,
        name: metadata?.name,
        symbol: metadata?.symbol,
        decimals: token.decimals,
        balance: token.balance,
        balanceRaw: token.balanceRaw,
      };
      
      // Debug log for tokens without names
      if (!result.name && !result.symbol) {
        console.log(`Token ${token.mint} has no name or symbol from any source`);
      }
      
      return result;
    });

    console.log(`Returning ${tokensWithMetadata.length} tokens, ${tokensWithMetadata.filter(t => t.name || t.symbol).length} with metadata`);

    return NextResponse.json({
      cluster,
      verified: true,
      mints: tokensWithMetadata.map((t) => t.mint),
      tokens: tokensWithMetadata, // Include full token info with metadata
    });
  } catch (error: any) {
    console.error("Wallet verification error:", error);

    // Return error but don't fail completely
    return NextResponse.json(
      {
        error: "Couldn't fetch tokens right now. You can still submit the form or add a contract address manually.",
        cluster: process.env.SOLANA_CLUSTER || "devnet",
        verified: false,
        mints: [],
        tokens: [],
      },
      { status: 200 } // Still return 200 so form isn't blocked
    );
  }
}

