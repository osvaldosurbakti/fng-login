import { connectDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" }, 
        { status: 400 }
      );
    }

    await connectDB();

    // Cek jika user sudah ada menggunakan Mongoose
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" }, 
        { status: 400 }
      );
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);
    
    // Buat user baru menggunakan Mongoose
    const user = await User.create({
      name: name || "",
      email,
      password: hash,
      role: role === "superadmin" ? "superadmin" : "admin",
    });

    return NextResponse.json({ 
      ok: true, 
      id: user._id.toString(),
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Optional: GET method untuk mendapatkan list users
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const users = await User.find({})
      .select("-password") // Exclude password field
      .sort({ createdAt: -1 });
    
    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}