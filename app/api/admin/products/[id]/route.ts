// app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return { error: "Unauthorized", status: 401 };
  }

  if (!["superadmin", "admin"].includes(session.user?.role || "")) {
    return { error: "Forbidden - Admin access required", status: 403 };
  }

  return { session };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authCheck = await checkAdminAccess();
    if (authCheck.error) {
      return NextResponse.json(
        { error: authCheck.error }, 
        { status: authCheck.status }
      );
    }

    const updateData = await request.json();

    await connectDB();

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // If name is being updated, check for duplicates
    if (updateData.name && updateData.name !== existingProduct.name) {
      const nameExists = await Product.findOne({
        name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
        _id: { $ne: id }
      });
      if (nameExists) {
        return NextResponse.json(
          { error: "Product with this name already exists" },
          { status: 409 }
        );
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...updateData, name: updateData.name?.trim() },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { 
        message: "Product updated successfully", 
        product: updatedProduct 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authCheck = await checkAdminAccess();
    if (authCheck.error) {
      return NextResponse.json(
        { error: authCheck.error }, 
        { status: authCheck.status }
      );
    }

    await connectDB();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await Product.findByIdAndDelete(id);

    if (authCheck.session && authCheck.session.user && authCheck.session.user.email) {
      console.log(`Product ${product.name} deleted by ${authCheck.session.user.email}`);
    } else {
      console.log(`Product ${product.name} deleted by unknown user`);
    }

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}