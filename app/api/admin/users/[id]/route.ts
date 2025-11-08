// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// Helper function untuk authorization
async function checkSuperAdminAccess() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return { error: "Unauthorized", status: 401 };
  }

  if (session.user?.role !== "superadmin") {
    return { error: "Forbidden - Superadmin access required", status: 403 };
  }

  return { session };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params adalah Promise
) {
  try {
    // === TAMBAHKAN AWAIT DI SINI ===
    const { id } = await params; // Await params terlebih dahulu
    
    // Check authorization
    const authCheck = await checkSuperAdminAccess();
    if (authCheck.error) {
      return NextResponse.json(
        { error: authCheck.error }, 
        { status: authCheck.status }
      );
    }

    const { name, email, password, role } = await request.json();

    // Validate input
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Name, email, and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["superadmin", "admin", "user"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user exists - SEKARANG GUNAKAN id YANG SUDAH DI-AWAIT
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent role escalation - superadmin cannot be demoted by others
    if (existingUser.role === "superadmin" && 
        role !== "superadmin" && 
        authCheck.session.user.id !== existingUser._id.toString()) {
      return NextResponse.json(
        { error: "Cannot change superadmin role" },
        { status: 400 }
      );
    }

    // Prevent non-superadmin from creating superadmin
    if (role === "superadmin" && existingUser.role !== "superadmin") {
      return NextResponse.json(
        { error: "Cannot assign superadmin role to existing user" },
        { status: 400 }
      );
    }

    // Check if email is taken by another user
    const emailExists = await User.findOne({ 
      email: email.toLowerCase(), 
      _id: { $ne: id } // Gunakan id yang sudah di-await
    });
    if (emailExists) {
      return NextResponse.json(
        { error: "Email already taken by another user" },
        { status: 409 }
      );
    }

    // Prepare update data
    const updateData: any = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role,
    };

    // Only update password if provided and valid
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id, // Gunakan id yang sudah di-await
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    return NextResponse.json(
      { 
        message: "User updated successfully", 
        user: updatedUser 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params adalah Promise
) {
  try {
    // === TAMBAHKAN AWAIT DI SINI ===
    const { id } = await params; // Await params terlebih dahulu
    
    // Check authorization
    const authCheck = await checkSuperAdminAccess();
    if (authCheck.error) {
      return NextResponse.json(
        { error: authCheck.error }, 
        { status: authCheck.status }
      );
    }

    await connectDB();

    // Check if user exists - SEKARANG GUNAKAN id YANG SUDAH DI-AWAIT
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deletion of superadmin users
    if (user.role === "superadmin") {
      return NextResponse.json(
        { error: "Cannot delete superadmin users" },
        { status: 400 }
      );
    }

    // Prevent user from deleting themselves
    if (user._id.toString() === authCheck.session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    await User.findByIdAndDelete(id); // Gunakan id yang sudah di-await

    // Log the deletion action
    console.log(`User ${user.email} deleted by ${authCheck.session.user.email}`);

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: GET user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params adalah Promise
) {
  try {
    // === TAMBAHKAN AWAIT DI SINI ===
    const { id } = await params; // Await params terlebih dahulu
    
    const authCheck = await checkSuperAdminAccess();
    if (authCheck.error) {
      return NextResponse.json(
        { error: authCheck.error }, 
        { status: authCheck.status }
      );
    }

    await connectDB();

    const user = await User.findById(id).select("-password"); // Gunakan id yang sudah di-await
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}