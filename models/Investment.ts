import mongoose, { Schema, Document, Model } from "mongoose";

export type InvestmentType = "verified" | "unverified" | "angel";

export interface IInvestment extends Document {
  investorId: mongoose.Types.ObjectId;
  type: InvestmentType;
  // For verified/unverified investments
  tokenSymbol?: string;
  projectName?: string;
  tokenCA?: string;
  // For angel investments
  companyName?: string;
  notes?: string;
  stage?: string; // "preseed" | "seed" | "seriesA" | "later"
  // Common fields
  amountUsd: number;
  source: string; // "onchain_fetch" | "manual" | "angel"
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const InvestmentSchema = new Schema<IInvestment>(
  {
    investorId: {
      type: Schema.Types.ObjectId,
      ref: "Investor",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["verified", "unverified", "angel"],
      required: true,
      index: true,
    },
    tokenSymbol: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    projectName: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    tokenCA: {
      type: String,
      trim: true,
      maxlength: 44,
    },
    companyName: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    stage: {
      type: String,
      trim: true,
      enum: ["preseed", "seed", "seriesA", "later"],
    },
    amountUsd: {
      type: Number,
      required: true,
      min: 0,
    },
    source: {
      type: String,
      required: true,
      enum: ["onchain_fetch", "manual", "angel"],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 10,
        message: "Tags array cannot exceed 10 items",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
InvestmentSchema.index({ investorId: 1, type: 1 });
InvestmentSchema.index({ investorId: 1, createdAt: -1 });

const Investment: Model<IInvestment> =
  mongoose.models.Investment || mongoose.model<IInvestment>("Investment", InvestmentSchema);

export default Investment;

