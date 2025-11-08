import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// import "dotenv/config";

dotenv.config({ path: ".env.local" }); // ← tambahkan ini


const uri = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error("❌ MONGODB_URI is not defined in .env.local");
}

const client = new MongoClient(uri);

async function seed() {
  try {
    await client.connect();
    const db = client.db("fng-login"); // nama database
    const users = db.collection("users");

    // Hapus user lama agar seeding bisa diulang
    await users.deleteMany({});

    const hashedSuperadmin = await bcrypt.hash("superadmin123", 10);
    const hashedAdmin = await bcrypt.hash("admin123", 10);

    const data = [
      {
        name: "Super Admin",
        email: "superadmin@example.com",
        password: hashedSuperadmin,
        role: "superadmin",
        createdAt: new Date(),
      },
      {
        name: "Admin User",
        email: "admin@example.com",
        password: hashedAdmin,
        role: "admin",
        createdAt: new Date(),
      },
    ];

    await users.insertMany(data);

    console.log("✅ Seeder berhasil dijalankan!");
    console.table(
      data.map((u) => ({
        email: u.email,
        role: u.role,
        password: u.role === "superadmin" ? "superadmin123" : "admin123",
      }))
    );
  } catch (error) {
    console.error("❌ Gagal menjalankan seeder:", error);
  } finally {
    await client.close();
  }
}

seed();
