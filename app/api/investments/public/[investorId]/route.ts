import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Investment from "@/models/Investment";
import Investor from "@/models/Investor";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { investorId: string } }
) {
  try {
    await connectDB();

    const { investorId } = await params;

    // Verify investor exists
    const investor = await Investor.findById(investorId).lean();
    if (!investor) {
      return NextResponse.json({ error: "Investor not found" }, { status: 404 });
    }

    // Fetch investments for this investor
    const investments = await Investment.find({ investorId })
      .select("type projectName tokenSymbol companyName amountUsd tags createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ investments });
  } catch (error: any) {
    console.error("Error fetching public investments:", error);
    return NextResponse.json(
      { error: "Failed to fetch investments" },
      { status: 500 }
    );
  }
}

