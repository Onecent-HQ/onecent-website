import { handler } from "@civic/auth/nextjs";
import { NextRequest, NextResponse } from "next/server";

const civicHandler = handler();

// Wrap GET handler with logging
export async function GET(request: NextRequest, context: any) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    console.log("🔐 Auth GET:", {
      path: request.nextUrl.pathname,
      fullUrl: request.url,
      params: searchParams,
      hasCode: !!searchParams.code,
      hasState: !!searchParams.state,
      hasError: !!searchParams.error,
      baseUrl: process.env.BASE_URL || "❌ NOT SET",
      civicauth: context?.params?.civicauth,
    });
    
    // If there's an OAuth error, log it
    if (searchParams.error) {
      console.error("❌ OAuth error from provider:", searchParams.error, searchParams.error_description);
    }
    
    // Check if this is a callback without required params
    if (context?.params?.civicauth?.[0] === 'callback' && !searchParams.code && !searchParams.error) {
      console.warn("⚠️  Callback hit without OAuth params - this might be a direct access or premature call");
    }
    
    const response = await civicHandler(request);
    console.log("✅ Auth GET response:", response.status);
    
    // If it's a 400, log additional debug info
    if (response.status === 400) {
      console.error("❌ 400 Bad Request details:", {
        hasCode: !!searchParams.code,
        hasState: !!searchParams.state,
        paramsCount: Object.keys(searchParams).length,
      });
    }
    
    return response;
  } catch (error: any) {
    console.error("❌ Auth callback error:", error.message || error);
    return NextResponse.json(
      { error: error.message || "Authentication failed", details: error.toString() },
      { status: 500 }
    );
  }
}

// Wrap POST handler with logging
export async function POST(request: NextRequest, context: any) {
  try {
    console.log("🔐 Auth POST:", {
      path: request.nextUrl.pathname,
      baseUrl: process.env.BASE_URL || "❌ NOT SET",
      civicauth: context?.params?.civicauth,
    });
    
    const response = await civicHandler(request);
    console.log("✅ Auth POST response:", response.status);
    return response;
  } catch (error: any) {
    console.error("❌ Auth POST error:", error.message || error);
    return NextResponse.json(
      { error: error.message || "Authentication failed", details: error.toString() },
      { status: 500 }
    );
  }
}

