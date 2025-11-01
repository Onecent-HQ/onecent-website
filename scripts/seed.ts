import mongoose from "mongoose";
import Investor from "../models/Investor";
import connectDB from "../lib/db";

const DEMO_INVESTORS = [
  {
    slug: "alice-crypto",
    name: "Alice Crypto",
    headline: "Early-stage Web3 investor focused on DeFi and infrastructure",
    bio: "I've been investing in Web3 since 2020, with a particular focus on DeFi protocols and infrastructure projects. I believe in supporting founders from the earliest stages and helping them navigate the complexities of building in crypto.",
    xHandle: "alicecrypto",
    telegram: "alicecrypto",
    niches: ["DeFi", "Infra", "Payments"],
    topInvestments: [
      {
        projectName: "SolanaPay",
        tokenCA: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      },
      {
        projectName: "Jupiter Exchange",
      },
    ],
    prefs: {
      avgTicketSizeUsd: 50000,
      stageFocus: "seed",
      onChainFocusPct: 80,
      activityLevel: "high",
      checksPerYear: 25,
      openToColdPitches: true,
    },
    contactPass: {
      enabled: true,
      grantedAt: new Date(),
    },
    auth: {
      provider: "x",
      xId: "demo_alice_123",
    },
  },
  {
    slug: "bob-ventures",
    name: "Bob Ventures",
    headline: "Consumer Web3 and gaming investor",
    bio: "Passionate about consumer-facing Web3 applications and gaming. I look for teams that understand user experience and can bridge the gap between Web2 and Web3.",
    xHandle: "bobventures",
    telegram: "bobventures",
    niches: ["Gaming", "Consumer", "AI"],
    topInvestments: [
      {
        projectName: "Magic Eden",
      },
      {
        projectName: "StepN",
        tokenCA: "11111111111111111111111111111111",
      },
      {
        projectName: "Star Atlas",
      },
    ],
    prefs: {
      avgTicketSizeUsd: 100000,
      stageFocus: "seriesA",
      onChainFocusPct: 60,
      activityLevel: "medium",
      checksPerYear: 15,
      openToColdPitches: false,
    },
    contactPass: {
      enabled: false,
    },
    auth: {
      provider: "x",
      xId: "demo_bob_456",
    },
  },
];

async function seed() {
  try {
    await connectDB();
    console.log("Connected to database");

    for (const investorData of DEMO_INVESTORS) {
      const existing = await Investor.findOne({ slug: investorData.slug });
      if (existing) {
        console.log(`Investor ${investorData.slug} already exists, skipping...`);
        continue;
      }

      const investor = new Investor(investorData);
      await investor.save();
      console.log(`Created investor: ${investorData.slug}`);
    }

    console.log("Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();

