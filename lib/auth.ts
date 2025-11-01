import { getUser } from "@civic/auth/nextjs";
import connectDB from "@/lib/db";
import Investor from "@/models/Investor";

export async function getCurrentInvestor() {
  try {
    const user = await getUser();
    if (!user || !user.id) {
      return null;
    }

    await connectDB();

    const investor = await Investor.findOne({
      "auth.provider": "x",
      "auth.xId": user.id,
    }).lean();

    return investor;
  } catch (error) {
    console.error("Error getting current investor:", error);
    return null;
  }
}

export async function ensureInvestorFromUser() {
  try {
    const user = await getUser();
    if (!user || !user.id) {
      return null;
    }

    await connectDB();

    const xHandle = user.username || user.name?.replace("@", "") || "";
    const name = user.name || xHandle || "Investor";
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Check for existing slug
    let slug = baseSlug;
    let counter = 1;
    while (await Investor.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const investor = await Investor.findOneAndUpdate(
      {
        "auth.provider": "x",
        "auth.xId": user.id,
      },
      {
        $setOnInsert: {
          slug,
          name,
          xHandle: xHandle,
          auth: {
            provider: "x",
            xId: user.id,
          },
          prefs: {
            avgTicketSizeUsd: 50000,
            stageFocus: "seed",
            onChainFocusPct: 50,
            activityLevel: "medium",
            checksPerYear: 10,
            openToColdPitches: false,
          },
          contactPass: { enabled: false },
          verified: false,
        },
      },
      {
        upsert: true,
        new: true,
      }
    ).lean();

    return investor;
  } catch (error) {
    console.error("Error ensuring investor:", error);
    return null;
  }
}

