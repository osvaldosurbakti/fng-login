import { config } from 'dotenv';
config({ path: '.env.local' });

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
   console.error('❌ MONGODB_URI is not defined in .env.local');
  console.error('Available env vars:', Object.keys(process.env));
  throw new Error("❌ MONGODB_URI is not defined in .env.local");
}

// Cache the connection (biar tidak reconnect setiap request)
let isConnected: boolean = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = !!db.connections[0].readyState;
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
};
