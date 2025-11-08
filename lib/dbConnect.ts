import mongoose from "mongoose";

export const connectToDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGODB_URI as string);
};
