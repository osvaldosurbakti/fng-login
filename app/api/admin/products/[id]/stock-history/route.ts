// app/api/admin/products/[id]/stock-history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import StockMovement from "@/models/StockMovement";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("Stock history API called");
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // AWAIT THE PARAMS PROMISE
    const unwrappedParams = await params;
    const productId = unwrappedParams.id;

    console.log("Product ID:", productId);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    await connectDB();

    // Get stock history dengan populate
    const history = await StockMovement.find({ product: productId })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('product', 'name sku unit')
      .lean();

    console.log(`Found ${history.length} stock movements for product ${productId}`);

    return NextResponse.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error("Stock history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}