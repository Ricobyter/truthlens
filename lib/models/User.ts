import mongoose, { Schema, Document, Model } from "mongoose";
import type { PlanId } from "@/lib/plans";

export interface IUser extends Document {
  email: string;
  name?: string;
  image?: string;
  hashedPassword?: string;
  emailVerified?: Date;
  plan: PlanId;
  planExpiresAt?: Date;
  questionsToday: number;
  lastResetDate: Date;
  razorpayCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: String,
    image: String,
    hashedPassword: String,
    emailVerified: Date,
    plan: {
      type: String,
      enum: ["free", "silver", "gold"],
      default: "free",
    },
    planExpiresAt: Date,
    questionsToday: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: () => new Date() },
    razorpayCustomerId: String,
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default User;
