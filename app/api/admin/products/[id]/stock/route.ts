// app/api/admin/products/[id]/stock/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import StockMovement from "@/models/StockMovement";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["superadmin", "admin"].includes(session.user?.role || "")) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const { newStock, adjustmentType, quantity, notes } = await request.json();

    await connectDB();

    // Get current product
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!product.isTrackStock) {
      return NextResponse.json({ error: "Stock tracking is disabled for this product" }, { status: 400 });
    }

    const oldStock = product.currentStock;
    
    // Validate new stock
    if (newStock < 0) {
      return NextResponse.json({ error: "Stock cannot be negative" }, { status: 400 });
    }

    // Update product stock
    product.currentStock = newStock;
    await product.save();

    // Create stock movement record
    const movement = new StockMovement({
      product: product._id,
      type: newStock > oldStock ? 'in' : 'out',
      quantity: Math.abs(newStock - oldStock),
      reference: `ADJ-${Date.now()}`,
      notes: notes || `Manual adjustment: ${adjustmentType}`,
      previousStock: oldStock,
      newStock: newStock,
      adjustedBy: session.user.id,
    });

    await movement.save();

    console.log(`Stock adjusted by ${session.user.email}: ${product.name} from ${oldStock} to ${newStock}`);

    return NextResponse.json({
      message: "Stock updated successfully",
      product: {
        id: product._id,
        name: product.name,
        oldStock,
        newStock,
        difference: newStock - oldStock
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Stock adjustment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}