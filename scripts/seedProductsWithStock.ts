// scripts/seedProductsWithStock.ts
// Load dotenv dengan require (lebih reliable) - HARUS DI BARIS PALING ATAS
require('dotenv').config({ path: '.env.local' });

console.log("🔧 Seeder - MONGODB_URI:", process.env.MONGODB_URI ? "✅ LOADED" : "❌ MISSING");

import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

const menuItems = [
  // Minuman - Rp6,000.00
  { name: "Tora Bika Cappuccino", price: 6000, category: "minuman", unit: "sachet" },
  { name: "Milo", price: 6000, category: "minuman", unit: "sachet" },
  { name: "Good Day Cappuccino", price: 6000, category: "minuman", unit: "sachet" },
  { name: "ABC Iced Klepon", price: 6000, category: "minuman", unit: "botol" },
  { name: "Max Tea Tarik", price: 6000, category: "minuman", unit: "sachet" },
  { name: "Good Day Freeze", price: 6000, category: "minuman", unit: "sachet" },
  
  // Minuman - Rp5,000.00
  { name: "Energen Jahe", price: 5000, category: "minuman", unit: "sachet" },
  { name: "Kopi Susu ABC", price: 5000, category: "minuman", unit: "botol" },
  { name: "Luwak White Koffie", price: 5000, category: "minuman", unit: "sachet" },
  { name: "Tora Bika Susu", price: 5000, category: "minuman", unit: "sachet" },
  { name: "Good Day Latte", price: 5000, category: "minuman", unit: "sachet" },
  { name: "Kapal Api Special Mix", price: 5000, category: "minuman", unit: "sachet" },
  { name: "Tora Bika Moka", price: 5000, category: "minuman", unit: "sachet" },
  { name: "Energen Coklat", price: 5000, category: "minuman", unit: "sachet" },
  
  // Makanan - Rp7,000.00
  { name: "Mie Instant (All varian)", price: 7000, category: "makanan", unit: "pcs" },
  
  // Makanan - Rp6,000.00
  { name: "Dumpling Keju (3 pcs)", price: 6000, category: "makanan", unit: "pack" },
  { name: "Dumpling Ayam (3 pcs)", price: 6000, category: "makanan", unit: "pack" },
  
  // Makanan - Rp5,000.00
  { name: "Sosis Besar Jumbo (1 pcs)", price: 5000, category: "makanan", unit: "pcs" },
  { name: "Nugget Double (2 pcs)", price: 5000, category: "makanan", unit: "pcs" },
  { name: "Cikuwa + Jamur (3 pcs)", price: 5000, category: "makanan", unit: "pack" },
  
  // Makanan - Rp3,000.00
  { name: "Odeng Double (2 pcs)", price: 3000, category: "makanan", unit: "pcs" },
  { name: "Tofu Special (3 pcs)", price: 3000, category: "makanan", unit: "pack" },
  { name: "Bakso Bakar (3 pcs)", price: 3000, category: "makanan", unit: "pack" },
  { name: "Tempura (3 pcs)", price: 3000, category: "makanan", unit: "pack" },
  { name: "Sosis Merah (1 pcs)", price: 3000, category: "makanan", unit: "pcs" },
];

async function seedProductsWithStock() {
  try {
    console.log("🌱 Starting product seeding with stock data...");
    
    // Debug: Check environment variables
    console.log("🔧 Checking environment variables...");
    console.log("MONGODB_URI:", process.env.MONGODB_URI ? "✅ Loaded" : "❌ Missing");
    
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI is required but not found!");
      console.error("💡 Please check your .env.local file");
      process.exit(1);
    }

    await connectDB();
    console.log("✅ Connected to database");

    // HAPUS SEMUA DATA LAMA
    console.log("🗑️ Clearing existing products...");
    const deleteResult = await Product.deleteMany({});
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} old products`);

    console.log("📦 Inserting products with stock data...");
    
    // Insert new products dengan data stock yang lengkap
    const products = await Product.insertMany(
      menuItems.map(item => ({
        ...item,
        description: "",
        isAvailable: true,
        image: "",
        imagePublicId: "",
        
        // STOCK DATA BARU
        currentStock: 50,          // Stok awal
        minimumStock: 10,          // Alert ketika <= 10
        isTrackStock: true,        // Track stok enabled
        lowStockAlert: false,      // Akan di-update otomatis oleh model
      }))
    );

    console.log(`✅ Successfully seeded ${products.length} products with stock data!`);
    console.log("");
    console.log("📊 Sample products created:");
    console.log("══════════════════════════════════════");
    
    products.slice(0, 5).forEach(product => {
      console.log(`   🏷️  ${product.name}`);
      console.log(`      SKU: ${product.sku} | Stock: ${product.currentStock} ${product.unit}`);
      console.log(`      Price: Rp ${product.price.toLocaleString('id-ID')}`);
      console.log("");
    });

    console.log("🎯 Next steps:");
    console.log("   1. Go to /dashboard/stock to see inventory");
    console.log("   2. Go to /dashboard/menu to manage products"); 
    console.log("   3. Use bulk update to adjust stock levels");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedProductsWithStock();