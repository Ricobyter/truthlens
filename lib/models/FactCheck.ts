import mongoose, { Schema, Document, Model } from "mongoose";
import type { BiasAnalysis, Verdict } from "@/types";

export interface IFactCheck extends Document {
  userId: mongoose.Types.ObjectId;
  claim: string;
  claimHash: string;
  verdict: Verdict;
  confidence: number;
  summary: string;
  reasoning: string[];
  sources: Array<{ title: string; url: string; snippet?: string; publishedDate?: string }>;
  bias?: BiasAnalysis;
  isRealTime?: boolean;
  fromCache?: boolean;
  createdAt: Date;
}

const SourceSchema = new Schema(
  { title: String, url: String, snippet: String, publishedDate: String },
  { _id: false }
);

const BiasSchema = new Schema(
  {
    politicalLean: {
      type: String,
      enum: ["LEFT", "CENTER-LEFT", "CENTER", "CENTER-RIGHT", "RIGHT", "MIXED", "NON-POLITICAL"],
    },
    emotionalLanguage: { type: Number, min: 0, max: 100 },
    sourceCredibility: { type: Number, min: 0, max: 100 },
    biasIndicators: [{ type: String }],
  },
  { _id: false }
);

const FactCheckSchema = new Schema<IFactCheck>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    claim: { type: String, required: true, maxlength: 5000 },
    claimHash: { type: String, required: true, index: true },
    verdict: {
      type: String,
      enum: ["TRUE", "FALSE", "MISLEADING", "PARTIALLY TRUE", "NOT ENOUGH EVIDENCE"],
      required: true,
    },
    confidence: { type: Number, min: 0, max: 100, required: true },
    summary: { type: String, required: true },
    reasoning: [{ type: String }],
    sources: [SourceSchema],
    bias: BiasSchema,
    isRealTime: { type: Boolean, default: false },
    fromCache: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index for fast cache lookups by hash + recency
FactCheckSchema.index({ claimHash: 1, createdAt: -1 });

const FactCheck: Model<IFactCheck> =
  mongoose.models.FactCheck ?? mongoose.model<IFactCheck>("FactCheck", FactCheckSchema);

export default FactCheck;
