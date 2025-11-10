// models/Product.ts
import { config } from 'dotenv';
config({ path: '.env.local' });

import mongoose, { Document, Model } from "mongoose";

// Define valid unit types
export type ProductUnit = "pcs" | "pack" | "box" | "kg" | "gram" | "ml" | "botol" | "sachet";

export interface IProduct extends Document {
  name: string;
  price: number;
  category: "makanan" | "minuman";
  description?: string;
  isAvailable: boolean;
  image?: string;
  imagePublicId?: string;
  
  // Stock Management Fields
  sku: string;
  unit: ProductUnit;
  currentStock: number;
  minimumStock: number;
  isTrackStock: boolean;
  lowStockAlert: boolean;
  
  // Tambahkan field untuk tracking
  lastStockUpdate?: Date;
  lastUpdatedBy?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: ["makanan", "minuman"],
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: "",
    },
    imagePublicId: {
      type: String,
      default: "",
    },
    
    // Stock Management Fields
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    unit: {
      type: String,
      default: "pcs",
      enum: ["pcs", "pack", "box", "kg", "gram", "ml", "botol", "sachet"],
    },
    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    minimumStock: {
      type: Number,
      default: 5,
      min: 0,
    },
    isTrackStock: {
      type: Boolean,
      default: true,
    },
    lowStockAlert: {
      type: Boolean,
      default: false,
    },
    
    // Tambahan field untuk history tracking
    lastStockUpdate: Date,
    lastUpdatedBy: String
  },
  {
    timestamps: true,
  }
);

// Auto-generate SKU jika tidak diisi
productSchema.pre('save', function(next) {
  if (!this.sku) {
    const prefix = this.category === 'makanan' ? 'FNG-F' : 'FNG-D';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.sku = `${prefix}-${random}`;
  }
  next();
});

// Update lowStockAlert berdasarkan currentStock
productSchema.pre('save', function(next) {
  if (this.isTrackStock && this.currentStock <= this.minimumStock) {
    this.lowStockAlert = true;
  } else {
    this.lowStockAlert = false;
  }
  next();
});

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

export default Product;