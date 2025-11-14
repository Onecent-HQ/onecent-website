import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Investment from "@/models/Investment";
import { getCurrentInvestor } from "@/lib/auth";

export const dynamic = 'force-dynamic';

const angelInvestmentSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(200),
  amountUsd: z.number().min(0, "Amount must be positive"),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).default([]),
  stage: z.enum(["preseed", "seed", "seriesA", "later"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const currentInvestor = await getCurrentInvestor();
    if (!currentInvestor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const validationResult = angelInvestmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const investment = new Investment({
      investorId: currentInvestor._id,
      type: "angel",
      companyName: data.companyName,
      amountUsd: data.amountUsd,
      notes: data.notes,
      stage: data.stage || "seed",
      source: "angel",
      tags: data.tags || [],
    });

    await investment.save();

    return NextResponse.json({ investment }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating angel investment:", error);
    return NextResponse.json(
      { error: "Failed to create investment" },
      { status: 500 }
    );
  }
}

