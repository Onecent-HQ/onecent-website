import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Investment from "@/models/Investment";
import { getCurrentInvestor } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const currentInvestor = await getCurrentInvestor();
    if (!currentInvestor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { tokens } = body; // Array of { mint, name, symbol, balance, balanceRaw, decimals, amountUsd?, tags? }

    if (!Array.isArray(tokens)) {
      return NextResponse.json(
        { error: "Tokens array is required" },
        { status: 400 }
      );
    }

    const savedInvestments = [];

    for (const token of tokens) {
      if (!token.mint) continue;

      // Check if investment already exists for this token
      const existing = await Investment.findOne({
        investorId: currentInvestor._id,
        type: "verified",
        tokenCA: token.mint,
      });

      if (existing) {
        // Update existing investment
        existing.amountUsd = token.amountUsd || 0;
        existing.tokenSymbol = token.symbol;
        existing.projectName = token.name || token.symbol;
        if (token.tags) existing.tags = token.tags;
        await existing.save();
        savedInvestments.push(existing);
      } else {
        // Create new investment
        const investment = new Investment({
          investorId: currentInvestor._id,
          type: "verified",
          tokenCA: token.mint,
          tokenSymbol: token.symbol,
          projectName: token.name || token.symbol || "Unknown Token",
          amountUsd: token.amountUsd || 0,
          source: "onchain_fetch",
          tags: token.tags || [],
        });
        await investment.save();
        savedInvestments.push(investment);
      }
    }

    return NextResponse.json({ investments: savedInvestments }, { status: 201 });
  } catch (error: any) {
    console.error("Error saving verified investments:", error);
    return NextResponse.json(
      { error: "Failed to save investments" },
      { status: 500 }
    );
  }
}

