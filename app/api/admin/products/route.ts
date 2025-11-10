// app/api/admin/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["superadmin", "admin"].includes(session.user?.role || "")) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const { name, price, category, description, isAvailable, image } = await request.json();

    // Validate input
    if (!name || !price || !category) {
      return NextResponse.json(
        { error: "Name, price, and category are required" },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: "Price must be greater than 0" },
        { status: 400 }
      );
    }

    if (!["makanan", "minuman"].includes(category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if product already exists
    const existingProduct = await Product.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    if (existingProduct) {
      return NextResponse.json(
        { error: "Product with this name already exists" },
        { status: 409 }
      );
    }

    // Create new product
    const newProduct = new Product({
      name: name.trim(),
      price,
      category,
      description: description?.trim() || "",
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      image: image?.trim() || "",
    });

    await newProduct.save();

    console.log(`Product created by ${session.user.email}: ${name}`);

    return NextResponse.json(
      { 
        message: "Product created successfully", 
        product: newProduct 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}