// scripts/seedProducts.ts
import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Ganti import dengan relative path
import { connectDB } from "../lib/mongodb";
import Product from "../models/Product";

const menuItems = [
  // ... your menu items data (tetap sama)
  // Minuman - Rp6,000.00
  { name: "Tora Bika Cappuccino", price: 6000, category: "minuman" },
  { name: "Milo", price: 6000, category: "minuman" },
  { name: "Good Day Cappuccino", price: 6000, category: "minuman" },
  { name: "ABC Iced Klepon", price: 6000, category: "minuman" },
  { name: "Max Tea Tarik", price: 6000, category: "minuman" },
  { name: "Good Day Freeze", price: 6000, category: "minuman" },
  
  // Minuman - Rp5,000.00
  { name: "Energen Jahe", price: 5000, category: "minuman" },
  { name: "Kopi Susu ABC", price: 5000, category: "minuman" },
  { name: "Luwak White Koffie", price: 5000, category: "minuman" },
  { name: "Tora Bika Susu", price: 5000, category: "minuman" },
  { name: "Good Day Latte", price: 5000, category: "minuman" },
  { name: "Kapal Api Special Mix", price: 5000, category: "minuman" },
  { name: "Tora Bika Moka", price: 5000, category: "minuman" },
  { name: "Energen Coklat", price: 5000, category: "minuman" },
  
  // Makanan - Rp7,000.00
  { name: "Mie Instant (All varian)", price: 7000, category: "makanan" },
  
  // Makanan - Rp6,000.00
  { name: "Dumpling Keju (3 pcs)", price: 6000, category: "makanan" },
  { name: "Dumpling Ayam (3 pcs)", price: 6000, category: "makanan" },
  
  // Makanan - Rp5,000.00
  { name: "Sosis Besar Jumbo (1 pcs)", price: 5000, category: "makanan" },
  { name: "Nugget Double (2 pcs)", price: 5000, category: "makanan" },
  { name: "Cikuwa + Jamur (3 pcs)", price: 5000, category: "makanan" },
  
  // Makanan - Rp3,000.00
  { name: "Odeng Double (2 pcs)", price: 3000, category: "makanan" },
  { name: "Tofu Special (3 pcs)", price: 3000, category: "makanan" },
  { name: "Bakso Bakar (3 pcs)", price: 3000, category: "makanan" },
  { name: "Tempura (3 pcs)", price: 3000, category: "makanan" },
  { name: "Sosis Merah (1 pcs)", price: 3000, category: "makanan" },
];

interface MongoError extends Error {
  code?: number;
}

async function seedProducts() {
  try {
    console.log("🌱 Starting product seeding...");
    console.log("📁 Loading environment variables...");
    
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env.local");
    }
    
    console.log("🔧 MONGODB_URI: ✅ Loaded");
    
    await connectDB();
    console.log("✅ Connected to database");

    // Validate connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database connection not ready");
    }

    // Check if products already exist
    try {
      const existingCount = await Product.countDocuments();
      if (existingCount > 0) {
        console.log(`📊 Database already has ${existingCount} products`);
        console.log("🎯 You can now edit products one by one to add images");
        await mongoose.connection.close();
        process.exit(0);
      }
    } catch (error) {
      const err = error as MongoError;
      throw new Error(`Failed to check existing products: ${err.message}`);
    }

    console.log("📦 Inserting products...");
    
    try {
      const products = await Product.insertMany(
        menuItems.map(item => ({
          ...item,
          description: "",
          isAvailable: true,
          image: "",
          imagePublicId: "",
        }))
      );

      console.log(`✅ Successfully seeded ${products.length} products to database!`);
      console.log("🎯 Next steps:");
      console.log("   1. Go to /dashboard/products");
      console.log("   2. Click 'Edit' on each product");
      console.log("   3. Upload images one by one");
      
    } catch (error) {
      const err = error as MongoError;
      throw new Error(`Failed to insert products: ${err.message}`);
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    const err = error as Error;
    console.error("❌ Seeding failed:", err.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Wrap the execution to handle any top-level errors
(async () => {
  try {
    await seedProducts();
  } catch (error) {
    console.error("Fatal error:", (error as Error).message);
    process.exit(1);
  }
})();