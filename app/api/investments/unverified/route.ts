import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Investment from "@/models/Investment";
import { getCurrentInvestor } from "@/lib/auth";

export const dynamic = 'force-dynamic';

const unverifiedInvestmentSchema = z.object({
  tokenSymbol: z.string().optional(),
  projectName: z.string().min(1, "Project name is required").max(200),
  tokenCA: z.string().optional(),
  amountUsd: z.number().min(0, "Amount must be positive"),
  tags: z.array(z.string()).default([]),
});

export async function POST(request: NextRequest) {
  try {
    const currentInvestor = await getCurrentInvestor();
    if (!currentInvestor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const validationResult = unverifiedInvestmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const investment = new Investment({
      investorId: currentInvestor._id,
      type: "unverified",
      tokenSymbol: data.tokenSymbol,
      projectName: data.projectName,
      tokenCA: data.tokenCA,
      amountUsd: data.amountUsd,
      source: "manual",
      tags: data.tags || [],
    });

    await investment.save();

    return NextResponse.json({ investment }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating unverified investment:", error);
    return NextResponse.json(
      { error: "Failed to create investment" },
      { status: 500 }
    );
  }
}

