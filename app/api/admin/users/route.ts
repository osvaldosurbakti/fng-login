// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is superadmin
    if (session.user?.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden - Superadmin access required" }, { status: 403 });
    }

    const { name, email, password, role } = await request.json();

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // === POINT 2: Prevent non-superadmin from creating superadmin ===
    if (role === "superadmin") {
      return NextResponse.json(
        { error: "Cannot create superadmin users through this endpoint" },
        { status: 400 }
      );
    }
    // === END OF POINT 2 ===

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "admin", // Default to admin if not specified
    });

    await newUser.save();

    // Log the action (you might want to create a logging system)
    console.log(`Admin user created by ${session.user.email}: ${email}`);

    return NextResponse.json(
      { message: "User created successfully", user: { id: newUser._id, name, email, role } },
      { status: 201 }
    );

  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}