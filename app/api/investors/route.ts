import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Investor from "@/models/Investor";

// Mark route as dynamic since it uses request.url for query parameters
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * PAGE_SIZE;

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { niches: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const [investors, total] = await Promise.all([
      Investor.find(query)
        .select("slug name headline niches xHandle verified updatedAt profileImage")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean(),
      Investor.countDocuments(query),
    ]);

    // Limit niches to 4 for list view
    const investorsWithLimitedNiches = investors.map((investor) => ({
      ...investor,
      niches: investor.niches?.slice(0, 4) || [],
    }));

    return NextResponse.json({
      investors: investorsWithLimitedNiches,
      pagination: {
        page,
        totalPages: Math.ceil(total / PAGE_SIZE),
        total,
        pageSize: PAGE_SIZE,
      },
    });
  } catch (error: any) {
    console.error("Investors list error:", error);
    const errorMessage =
      error?.message?.includes("connection string") ||
      error?.message?.includes("mongodb")
        ? "Database connection error. Please check your MONGODB_URI."
        : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
