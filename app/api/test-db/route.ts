import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Investor from "@/models/Investor";

export async function GET(request: NextRequest) {
  try {
    // Test MongoDB connection
    const connection = await connectDB();
    
    // Get connection state
    const connectionState = connection.connection.readyState;
    const stateNames = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting"
    };
    
    // Count total investors
    const totalInvestors = await Investor.countDocuments({});
    
    // Get sample investors (limit 5)
    const sampleInvestors = await Investor.find({})
      .select("slug name xHandle verified createdAt updatedAt")
      .limit(5)
      .lean()
      .sort({ updatedAt: -1 });
    
    // Get database name
    const dbName = connection.connection.db?.databaseName || "unknown";
    
    return NextResponse.json({
      success: true,
      connection: {
        state: connectionState,
        stateName: stateNames[connectionState as keyof typeof stateNames] || "unknown",
        database: dbName,
        host: connection.connection.host || "unknown",
      },
      data: {
        totalInvestors,
        sampleInvestors: sampleInvestors.map((inv: any) => ({
          slug: inv.slug,
          name: inv.name,
          xHandle: inv.xHandle,
          verified: inv.verified,
          createdAt: inv.createdAt,
          updatedAt: inv.updatedAt,
        })),
      },
      message: connectionState === 1 
        ? "✅ MongoDB connection successful! Data is being stored." 
        : "⚠️ MongoDB connection issue detected.",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to connect to MongoDB",
        details: error.toString(),
        message: "❌ MongoDB connection failed. Please check your MONGODB_URI.",
      },
      { status: 500 }
    );
  }
}

