import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Investment from "@/models/Investment";
import { getCurrentInvestor } from "@/lib/auth";

export const dynamic = 'force-dynamic';

const updateInvestmentSchema = z.object({
  tags: z.array(z.string()).optional(),
  amountUsd: z.number().min(0).optional(),
  projectName: z.string().max(200).optional(),
  companyName: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  stage: z.enum(["preseed", "seed", "seriesA", "later"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentInvestor = await getCurrentInvestor();
    if (!currentInvestor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const validationResult = updateInvestmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const investment = await Investment.findOne({
      _id: id,
      investorId: currentInvestor._id,
    });

    if (!investment) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 });
    }

    const data = validationResult.data;
    if (data.tags !== undefined) investment.tags = data.tags;
    if (data.amountUsd !== undefined) investment.amountUsd = data.amountUsd;
    if (data.projectName !== undefined) investment.projectName = data.projectName;
    if (data.companyName !== undefined) investment.companyName = data.companyName;
    if (data.notes !== undefined) investment.notes = data.notes;
    if (data.stage !== undefined) investment.stage = data.stage;

    await investment.save();

    return NextResponse.json({ investment });
  } catch (error: any) {
    console.error("Error updating investment:", error);
    return NextResponse.json(
      { error: "Failed to update investment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentInvestor = await getCurrentInvestor();
    if (!currentInvestor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    const investment = await Investment.findOneAndDelete({
      _id: id,
      investorId: currentInvestor._id,
    });

    if (!investment) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting investment:", error);
    return NextResponse.json(
      { error: "Failed to delete investment" },
      { status: 500 }
    );
  }
}

