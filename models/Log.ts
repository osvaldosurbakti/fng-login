import mongoose, { Document, Model, Types } from "mongoose";

export interface ILog extends Document {
  _id: Types.ObjectId;
  userEmail: string;
  role: string;
  action: string;
  timestamp: Date;
}

const logSchema = new mongoose.Schema<ILog>({
  userEmail: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user",
  },
  action: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Log: Model<ILog> = mongoose.models.Log || mongoose.model<ILog>("Log", logSchema);

export default Log;