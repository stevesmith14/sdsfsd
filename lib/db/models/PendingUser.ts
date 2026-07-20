import mongoose, { Schema, Document } from "mongoose";

export interface IPendingUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  verificationTokenHash: string;
  expiresAt: Date;
}

const PendingUserSchema = new Schema<IPendingUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  verificationTokenHash: {
    type: String,
    required: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // Automatically delete when expiresAt is reached
  },
});

export default mongoose.models.PendingUser || mongoose.model<IPendingUser>("PendingUser", PendingUserSchema);
