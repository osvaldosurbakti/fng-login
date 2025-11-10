// scripts/seedFinal.js - SUPER SIMPLE VERSION
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

console.log("🔧 MONGODB_URI:", process.env.MONGODB_URI ? "✅ LOADED" : "❌ MISSING");

if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing!");
  process.exit(1);
}

// Define schema langsung di script ini (bypass model issues)
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, enum: ["makanan", "minuman"], required: true },
  description: { type: String, default: "" },
  isAvailable: { type: Boolean, default: true },
  image: { type: String, default: "" },
  imagePublicId: { type: String, default: "" },
  sku: { type: String, unique: true, sparse: true },
  unit: { type: String, default: "pcs", enum: ["pcs", "pack", "box", "kg", "gram", "ml", "botol", "sachet"] },
  currentStock: { type: Number, default: 0 },
  minimumStock: { type: Number, default: 5 },
  isTrackStock: { type: Boolean, default: true },
  lowStockAlert: { type: Boolean, default: false },
}, { timestamps: true });

// Auto-generate SKU
productSchema.pre('save', function(next) {
  if (!this.sku) {
    const prefix = this.category === 'makanan' ? 'FNG-F' : 'FNG-D';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.sku = `${prefix}-${random}`;
  }
  next();
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const menuItems = [
  { name: "Tora Bika Cappuccino", price: 6000, category: "minuman", unit: "sachet" },
  { name: "Milo", price: 6000, category: "minuman", unit: "sachet" },
  { name: "Good Day Cappuccino", price: 6000, category: "minuman", unit: "sachet" },
  { name: "ABC Iced Klepon", price: 6000, category: "minuman", unit: "botol" },
  { name: "Max Tea Tarik", price: 6000, category: "minuman", unit: "sachet" },
  { name: "Good Day Freeze", price: 6000, category: "minuman", unit: "sachet" },
  { name: "Energen Jahe", price: 5000, category: "minuman", unit: "sachet" },
  { name: "Kopi Susu ABC", price: 5000, category: "minuman", unit: "botol" },
  { name: "Luwak White Koffie", price: 5000, category: "minuman", unit: "sachet" },
  { name: "Tora Bika Susu", price: 5000, category: "minuman", unit: "sachet" },
  { name: "Good Day Latte", price: 5000, category: "minuman", unit: "sachet" },
  { name: "Kapal Api Special Mix", price: 5000, category: "minuman", unit: "sachet" },
  { name: "Tora Bika Moka", price: 5000, category: "minuman", unit: "sachet" },
  { name: "Energen Coklat", price: 5000, category: "minuman", unit: "sachet" },
  { name: "Mie Instant (All varian)", price: 7000, category: "makanan", unit: "pcs" },
  { name: "Dumpling Keju (3 pcs)", price: 6000, category: "makanan", unit: "pack" },
  { name: "Dumpling Ayam (3 pcs)", price: 6000, category: "makanan", unit: "pack" },
  { name: "Sosis Besar Jumbo (1 pcs)", price: 5000, category: "makanan", unit: "pcs" },
  { name: "Nugget Double (2 pcs)", price: 5000, category: "makanan", unit: "pcs" },
  { name: "Cikuwa + Jamur (3 pcs)", price: 5000, category: "makanan", unit: "pack" },
  { name: "Odeng Double (2 pcs)", price: 3000, category: "makanan", unit: "pcs" },
  { name: "Tofu Special (3 pcs)", price: 3000, category: "makanan", unit: "pack" },
  { name: "Bakso Bakar (3 pcs)", price: 3000, category: "makanan", unit: "pack" },
  { name: "Tempura (3 pcs)", price: 3000, category: "makanan", unit: "pack" },
  { name: "Sosis Merah (1 pcs)", price: 3000, category: "makanan", unit: "pcs" },
];

async function seedProducts() {
  try {
    console.log("🌱 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("🗑️ Clearing existing products...");
    await Product.deleteMany({});
    console.log("🗑️ All old products deleted");

    console.log("📦 Inserting new products...");
    const products = await Product.insertMany(
      menuItems.map(item => ({
        ...item,
        description: "",
        isAvailable: true,
        image: "",
        imagePublicId: "",
        currentStock: 50,
        minimumStock: 10,
        isTrackStock: true,
        lowStockAlert: false,
      }))
    );

    console.log(`✅ SUCCESS! Seeded ${products.length} products`);
    console.log("📊 Sample:");
    products.slice(0, 5).forEach(p => {
      console.log(`   🏷️ ${p.name}`);
      console.log(`      SKU: ${p.sku} | Stock: ${p.currentStock} ${p.unit}`);
      console.log(`      Price: Rp ${p.price.toLocaleString('id-ID')}`);
      console.log("");
    });

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedProducts();