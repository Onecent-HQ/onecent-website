import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Investor from "@/models/Investor";

// Mark route as dynamic since it uses dynamic route parameters
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const investor = await Investor.findOne({ slug: params.slug })
      .select("-__v -_id")
      .lean();

    if (!investor) {
      return NextResponse.json(
        { error: "Investor not found" },
        { status: 404 }
      );
    }

    // Only include telegram if contactPass is enabled
    const publicInvestor = {
      ...investor,
      telegram: investor.contactPass?.enabled ? investor.telegram : undefined,
      verified: investor.verified || false,
    };

    return NextResponse.json(publicInvestor);
  } catch (error) {
    console.error("Investor profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

