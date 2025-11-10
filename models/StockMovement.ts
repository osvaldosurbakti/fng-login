// models/StockMovement.ts
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IStockMovement extends Document {
  product: mongoose.Types.ObjectId;
  type: 'in' | 'out' | 'adjustment' | 'initial';
  quantity: number;
  reference?: string;
  notes?: string;
  previousStock: number;
  newStock: number;
  adjustedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const stockMovementSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    type: {
      type: String,
      enum: ['in', 'out', 'adjustment', 'initial'],
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    reference: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    previousStock: {
      type: Number,
      required: true
    },
    newStock: {
      type: Number,
      required: true
    },
    adjustedBy: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Index for better query performance
stockMovementSchema.index({ product: 1, createdAt: -1 });
stockMovementSchema.index({ createdAt: -1 });

const StockMovement: Model<IStockMovement> = 
  mongoose.models.StockMovement || mongoose.model<IStockMovement>('StockMovement', stockMovementSchema);

export default StockMovement;