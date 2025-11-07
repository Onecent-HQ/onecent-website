import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITopInvestment {
  projectName: string;
  tokenCA: string;
}

export interface IInvestorPrefs {
  avgTicketSizeUsd?: number;
  stageFocus?: "preseed" | "seed" | "seriesA" | "later";
  onChainFocusPct?: number;
  activityLevel?: "low" | "medium" | "high";
  checksPerYear?: number;
  openToColdPitches?: boolean;
}

export interface IContactPass {
  enabled: boolean;
  grantedAt?: Date;
}

export interface IAuth {
  provider: "x";
  xId: string;
}

export interface IInvestor extends Document {
  slug: string;
  name: string;
  headline?: string;
  bio?: string;
  profileImage?: string;
  xHandle?: string;
  telegram?: string;
  niches?: string[];
  topInvestments?: ITopInvestment[];
  prefs: IInvestorPrefs;
  contactPass: IContactPass;
  auth: IAuth;
  verified: boolean;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TopInvestmentSchema = new Schema<ITopInvestment>({
  projectName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  tokenCA: {
    type: String,
    required: true,
    trim: true,
    maxlength: 44,
  },
});

const InvestorPrefsSchema = new Schema<IInvestorPrefs>({
  avgTicketSizeUsd: {
    type: Number,
    min: 5000,
    max: 1000000,
  },
  stageFocus: {
    type: String,
    enum: ["preseed", "seed", "seriesA", "later"],
  },
  onChainFocusPct: {
    type: Number,
    min: 0,
    max: 100,
  },
  activityLevel: {
    type: String,
    enum: ["low", "medium", "high"],
  },
  checksPerYear: {
    type: Number,
    min: 0,
    max: 50,
  },
  openToColdPitches: {
    type: Boolean,
    default: false,
  },
});

const ContactPassSchema = new Schema<IContactPass>({
  enabled: {
    type: Boolean,
    default: false,
  },
  grantedAt: {
    type: Date,
  },
});

const AuthSchema = new Schema<IAuth>({
  provider: {
    type: String,
    enum: ["x"],
    required: true,
  },
  xId: {
    type: String,
    required: true,
    index: true, // This creates an index, don't add another one below
  },
});

const InvestorSchema = new Schema<IInvestor>(
  {
    slug: {
      type: String,
      required: true,
      unique: true, // This creates an index, don't add another one below
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    headline: {
      type: String,
      trim: true,
      maxlength: 140,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    profileImage: {
      type: String,
      trim: true,
    },
    xHandle: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    telegram: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    niches: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 6,
        message: "Niches array cannot exceed 6 items",
      },
    },
    topInvestments: {
      type: [TopInvestmentSchema],
      default: [],
    },
    prefs: {
      type: InvestorPrefsSchema,
      default: {},
    },
    contactPass: {
      type: ContactPassSchema,
      default: { enabled: false },
    },
    auth: {
      type: AuthSchema,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Removed duplicate index for slug (already has unique: true above)
InvestorSchema.index({ name: "text", niches: "text" });
// Removed duplicate index for auth.xId (already has index: true above)

const Investor: Model<IInvestor> =
  mongoose.models.Investor || mongoose.model<IInvestor>("Investor", InvestorSchema);

export default Investor;
