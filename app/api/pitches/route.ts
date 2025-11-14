import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Pitch from "@/models/Pitch";
import Investor from "@/models/Investor";
import { getUser } from "@civic/auth/nextjs";

export const dynamic = 'force-dynamic';

const pitchSchema = z.object({
  investorId: z.string().min(1, "Investor ID is required"),
  senderName: z.string().min(1, "Name is required").max(100),
  senderTwitter: z.string().min(1, "Twitter handle is required").max(50),
  projectName: z.string().min(1, "Project name is required").max(200),
  projectDescription: z.string().min(1, "Description is required").max(2000),
  deckUrl: z.string().url("Deck URL must be a valid URL"),
});

export async function POST(request: NextRequest) {
  try {
    // Require Civic-authenticated user, but do NOT require them to have an Investor profile.
    const civicUser = await getUser();
    if (!civicUser || !civicUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const validationResult = pitchSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify target investor exists and is open to pitches
    const targetInvestor = await Investor.findById(data.investorId).lean();
    if (!targetInvestor) {
      return NextResponse.json({ error: "Investor not found" }, { status: 404 });
    }

    if (!targetInvestor.prefs?.openToColdPitches) {
      return NextResponse.json(
        { error: "This investor is not open to cold pitches" },
        { status: 403 }
      );
    }

    // Prevent self-pitching for users who ALSO have an investor profile
    const senderInvestor = await Investor.findOne({
      "auth.provider": "x",
      "auth.xId": civicUser.id,
    }).lean();

    if (senderInvestor && targetInvestor._id.toString() === senderInvestor._id.toString()) {
      return NextResponse.json(
        { error: "Cannot send pitch to yourself" },
        { status: 400 }
      );
    }

    const pitch = new Pitch({
      investorId: data.investorId,
      senderUserId: senderInvestor?._id ?? null,
      senderAuthId: civicUser.id,
      senderAuthUsername: civicUser.username || civicUser.name || "",
      senderName: data.senderName,
      senderTwitter: data.senderTwitter.replace("@", ""),
      projectName: data.projectName,
      projectDescription: data.projectDescription,
      deckUrl: data.deckUrl,
    });

    await pitch.save();

    return NextResponse.json({ pitch }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating pitch:", error);
    return NextResponse.json(
      { error: "Failed to submit pitch" },
      { status: 500 }
    );
  }
}

