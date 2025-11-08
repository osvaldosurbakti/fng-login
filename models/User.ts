// models/User.ts
import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "superadmin" | "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema(
  {
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
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["superadmin", "admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;