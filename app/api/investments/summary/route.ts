import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Investment from "@/models/Investment";
import { getCurrentInvestor } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const currentInvestor = await getCurrentInvestor();
    if (!currentInvestor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const investments = await Investment.find({ investorId: currentInvestor._id }).lean();

    const summary = {
      verified: {
        total: 0,
        count: 0,
        investments: [] as any[],
      },
      unverified: {
        total: 0,
        count: 0,
        investments: [] as any[],
      },
      angel: {
        total: 0,
        count: 0,
        investments: [] as any[],
      },
    };

    investments.forEach((inv) => {
      const category = summary[inv.type as keyof typeof summary];
      category.total += inv.amountUsd;
      category.count += 1;
      category.investments.push(inv);
    });

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("Error fetching investment summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}

