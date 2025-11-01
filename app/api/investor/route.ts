import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Investor from "@/models/Investor";
import { getCurrentInvestor, ensureInvestorFromUser } from "@/lib/auth";
import {
  generateSlug,
  ensureUniqueSlug,
  sanitizeText,
  checkProfanity,
} from "@/lib/utils";
import { z } from "zod";

const topInvestmentSchema = z.object({
  projectName: z.string().min(1).max(200),
  tokenCA: z.string().min(1).max(44),
});

const investorSchema = z.object({
  name: z.string().min(1).max(80),
  headline: z.string().max(140).optional(),
  bio: z.string().max(1000).optional(),
  xHandle: z.string().max(50).optional(),
  telegram: z.string().max(50).optional(),
  niches: z.array(z.string()).max(6).optional(),
  topInvestments: z.array(topInvestmentSchema).optional(),
  prefs: z
    .object({
      avgTicketSizeUsd: z.number().min(5000).max(1000000).optional(),
      stageFocus: z.enum(["preseed", "seed", "seriesA", "later"]).optional(),
      onChainFocusPct: z.number().min(0).max(100).optional(),
      activityLevel: z.enum(["low", "medium", "high"]).optional(),
      checksPerYear: z.number().min(0).max(50).optional(),
      openToColdPitches: z.boolean().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    let currentInvestor = await getCurrentInvestor();
    
    // If no investor exists, create one
    if (!currentInvestor) {
      currentInvestor = await ensureInvestorFromUser();
      if (!currentInvestor) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    await connectDB();

    const body = await request.json();
    const validationResult = investorSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check profanity
    if (data.headline && checkProfanity(data.headline)) {
      return NextResponse.json(
        { error: "Headline contains inappropriate content" },
        { status: 400 }
      );
    }

    if (data.bio && checkProfanity(data.bio)) {
      return NextResponse.json(
        { error: "Bio contains inappropriate content" },
        { status: 400 }
      );
    }

    // Sanitize text fields
    const sanitizedData = {
      name: sanitizeText(data.name, 80),
      headline: data.headline ? sanitizeText(data.headline, 140) : undefined,
      bio: data.bio ? sanitizeText(data.bio, 1000) : undefined,
      xHandle: data.xHandle ? sanitizeText(data.xHandle.replace("@", ""), 50) : undefined,
      telegram: data.telegram ? sanitizeText(data.telegram.replace("@", ""), 50) : undefined,
      niches: data.niches || [],
      topInvestments: data.topInvestments || [],
      prefs: data.prefs || {},
    };

    // Generate and ensure unique slug
    const baseSlug = generateSlug(sanitizedData.name);
    const existingInvestor = await Investor.findById(currentInvestor._id);

    let slug = baseSlug;
    if (existingInvestor && existingInvestor.slug !== baseSlug) {
      const existingSlugs = await Investor.find({
        slug: { $regex: `^${baseSlug}(-\\d+)?$` },
        _id: { $ne: existingInvestor._id },
      }).select("slug");
      const slugList = existingSlugs.map((i) => i.slug);
      slug = await ensureUniqueSlug(baseSlug, slugList);
    } else if (!existingInvestor) {
      const existingSlugs = await Investor.find({
        slug: { $regex: `^${baseSlug}(-\\d+)?$` },
      }).select("slug");
      const slugList = existingSlugs.map((i) => i.slug);
      slug = await ensureUniqueSlug(baseSlug, slugList);
    }

    // Update investor
    const investor = await Investor.findByIdAndUpdate(
      currentInvestor._id,
      {
        slug,
        ...sanitizedData,
      },
      { new: true, runValidators: true }
    );

    if (!investor) {
      return NextResponse.json(
        { error: "Investor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      investor: {
        slug: investor.slug,
        name: investor.name,
      },
    });
  } catch (error: any) {
    console.error("Investor update error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
