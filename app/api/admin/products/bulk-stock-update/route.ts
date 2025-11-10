// app/api/admin/products/bulk-stock-update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import StockMovement from "@/models/StockMovement";
import { adjustStockWithHistory } from "@/lib/stockUtils";

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

    const results = [];
    const reference = `BULK-${actionType.toUpperCase()}-${Date.now()}`;

    for (const product of products) {
      try {
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

        // Determine movement type
        let movementType: 'in' | 'out' | 'adjustment' = 'adjustment';
        if (newStock > oldStock) movementType = 'in';
        if (newStock < oldStock) movementType = 'out';

        // Use utility function to update with history
        const result = await adjustStockWithHistory({
          productId: (product._id as string | { toString(): string }).toString(),
          newStock,
          adjustedBy: session.user.id || session.user.email || 'system',
          type: movementType,
          reference,
          notes: notes || `Bulk ${actionType} operation`
        });

        results.push({
          productId: product._id,
          success: true,
          productName: product.name,
          adjustment: result.adjustment,
          newStock: result.product.currentStock
        });

      } catch (error) {
        console.error(`Error updating product ${product._id}:`, error);
        results.push({
          productId: product._id,
          success: false,
          productName: product.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successfulUpdates = results.filter(r => r.success).length;

    console.log(`Bulk stock update by ${session.user.email}: ${actionType} ${quantity} for ${successfulUpdates}/${products.length} products`);

    return NextResponse.json({
      message: `Successfully updated ${successfulUpdates} products`,
      updatedCount: successfulUpdates,
      totalCount: products.length,
      actionType,
      quantity,
      results
    }, { status: 200 });

  } catch (error) {
    console.error("Bulk stock update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}