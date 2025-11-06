import { NextRequest, NextResponse } from "next/server";
import { getCurrentInvestor, ensureInvestorFromUser } from "@/lib/auth";

// Mark route as dynamic since it uses cookies for authentication
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    let investor = await getCurrentInvestor();

    // If no investor exists, create one
    if (!investor) {
      investor = await ensureInvestorFromUser();
      if (!investor) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    return NextResponse.json({ investor });
  } catch (error) {
    console.error("Get me error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

