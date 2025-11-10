// app/api/admin/products/bulk-stock-update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import StockMovement from "@/models/StockMovement";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["superadmin", "admin"].includes(session.user?.role || "")) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const { productIds, actionType, quantity, notes } = await request.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "No products selected" }, { status: 400 });
    }

    if (quantity < 0) {
      return NextResponse.json({ error: "Quantity cannot be negative" }, { status: 400 });
    }

    await connectDB();

    // Get all selected products
    const products = await Product.find({ 
      _id: { $in: productIds },
      isTrackStock: true 
    });

    if (products.length === 0) {
      return NextResponse.json({ error: "No valid products found for update" }, { status: 404 });
    }

    const updates = [];
    const movements = [];

    for (const product of products) {
      const oldStock = product.currentStock;
      let newStock = oldStock;

      // Calculate new stock based on action type
      switch (actionType) {
        case "set-all":
          newStock = quantity;
          break;
        case "add-all":
          newStock = oldStock + quantity;
          break;
        case "restock-all":
          newStock = (product.minimumStock || 0) + quantity;
          break;
        default:
          continue; // Skip invalid action types
      }

      // Ensure stock doesn't go negative
      if (newStock < 0) {
        newStock = 0;
      }

      // Update product
      product.currentStock = newStock;
      updates.push(product.save());

      // Create stock movement record
      const movement = new StockMovement({
        product: product._id,
        type: newStock > oldStock ? 'in' : newStock < oldStock ? 'out' : 'adjustment',
        quantity: Math.abs(newStock - oldStock),
        reference: `BULK-${actionType.toUpperCase()}-${Date.now()}`,
        notes: notes || `Bulk ${actionType} to ${quantity}`,
        previousStock: oldStock,
        newStock: newStock,
        adjustedBy: session.user.id,
      });
      movements.push(movement.save());
    }

    // Execute all updates
    await Promise.all(updates);
    await Promise.all(movements);

    console.log(`Bulk stock update by ${session.user.email}: ${actionType} ${quantity} for ${products.length} products`);

    return NextResponse.json({
      message: `Successfully updated ${products.length} products`,
      updatedCount: products.length,
      actionType,
      quantity
    }, { status: 200 });

  } catch (error) {
    console.error("Bulk stock update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}