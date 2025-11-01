import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Investor from "@/models/Investor";

// Admin toggle endpoint - in production, add proper admin authentication
const ADMIN_SECRET = process.env.ADMIN_SECRET || "CHANGE_THIS_IN_PRODUCTION";

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${ADMIN_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const investor = await Investor.findOneAndUpdate(
      { slug: params.slug },
      {
        "contactPass.enabled": true,
        "contactPass.grantedAt": new Date(),
      },
      { new: true }
    );

    if (!investor) {
      return NextResponse.json(
        { error: "Investor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contact pass enabled",
    });
  } catch (error) {
    console.error("Admin toggle error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

