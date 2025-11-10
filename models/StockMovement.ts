// models/StockMovement.ts
import mongoose, { Document, Model } from "mongoose";

export interface IStockMovement extends Document {
  product: mongoose.Types.ObjectId;
  type: 'in' | 'out' | 'adjustment';     // Masuk/Keluar/Adjustment
  quantity: number;
  reference: string;                     // No referensi (PO, SO, Adjustment)
  notes: string;
  previousStock: number;
  newStock: number;
  adjustedBy: string;                    // User ID yang melakukan adjustment
  createdAt: Date;
}

const stockMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    type: {
      type: String,
      enum: ['in', 'out', 'adjustment'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    reference: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    adjustedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for better query performance
stockMovementSchema.index({ product: 1, createdAt: -1 });
stockMovementSchema.index({ reference: 1 });

const StockMovement: Model<IStockMovement> =
  mongoose.models.StockMovement || mongoose.model<IStockMovement>("StockMovement", stockMovementSchema);

export default StockMovement;