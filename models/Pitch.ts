import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPitch extends Document {
  investorId: mongoose.Types.ObjectId;
  senderUserId?: mongoose.Types.ObjectId | null;
  senderAuthId?: string;
  senderAuthUsername?: string;
  senderName: string;
  senderTwitter: string;
  projectName: string;
  projectDescription: string;
  deckUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const PitchSchema = new Schema<IPitch>(
  {
    investorId: {
      type: Schema.Types.ObjectId,
      ref: "Investor",
      required: true,
      index: true,
    },
    senderUserId: {
      type: Schema.Types.ObjectId,
      ref: "Investor",
      required: false,
      default: null,
      index: true,
    },
    senderAuthId: {
      type: String,
      required: false,
      index: true,
      trim: true,
    },
    senderAuthUsername: {
      type: String,
      required: false,
      trim: true,
      maxlength: 50,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    senderTwitter: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    projectName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    projectDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    deckUrl: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
PitchSchema.index({ investorId: 1, createdAt: -1 });
PitchSchema.index({ senderUserId: 1, createdAt: -1 });

const Pitch: Model<IPitch> =
  mongoose.models.Pitch || mongoose.model<IPitch>("Pitch", PitchSchema);

export default Pitch;

