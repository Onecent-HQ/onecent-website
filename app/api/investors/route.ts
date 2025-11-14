import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Investor from "@/models/Investor";

// Mark route as dynamic since it uses request.url for query parameters
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();
    console.log("Database connected successfully");

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

    console.log("Fetching investors with query:", JSON.stringify(query));
    
    // Use a defensive sort - fallback to createdAt if updatedAt doesn't exist
    const [investors, total] = await Promise.all([
      Investor.find(query)
        .select("slug name headline niches xHandle verified updatedAt createdAt profileImage")
        .sort({ updatedAt: -1, createdAt: -1 }) // Sort by updatedAt first, then createdAt as fallback
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean()
        .catch((err) => {
          console.error("Error in Investor.find():", err);
          throw err;
        }),
      Investor.countDocuments(query).catch((err) => {
        console.error("Error in Investor.countDocuments():", err);
        throw err;
      }),
    ]);

    console.log(`Found ${investors.length} investors, total: ${total}`);

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
    // Enhanced error logging for production debugging
    console.error("Investors list error:", error);
    console.error("Error name:", error?.name);
    console.error("Error message:", error?.message);
    console.error("Error stack:", error?.stack);
    
    // More detailed error logging for debugging
    if (error?.message?.includes("MONGODB_URI")) {
      console.error("MONGODB_URI is missing in environment variables");
    }
    
    // Check for specific MongoDB errors
    if (error?.name === "MongoServerError" || error?.name === "MongooseError") {
      console.error("MongoDB/Mongoose specific error detected");
    }
    
    const errorMessage =
      error?.message?.includes("MONGODB_URI") ||
      error?.message?.includes("connection string") ||
      error?.message?.includes("mongodb") ||
      error?.name === "MongoServerError" ||
      error?.name === "MongooseError"
        ? "Database connection error. Please check your MONGODB_URI environment variable and ensure your database is accessible."
        : `Internal server error: ${error?.message || "Unknown error"}`;
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
