// lib/stockUtils.ts
import Product from '@/models/Product';
import StockMovement from '@/models/StockMovement';

interface StockAdjustmentParams {
  productId: string;
  newStock: number;
  adjustedBy: string;
  type: 'in' | 'out' | 'adjustment' | 'initial';
  reference?: string;
  notes?: string;
}

export async function adjustStockWithHistory(params: StockAdjustmentParams) {
  const { productId, newStock, adjustedBy, type, reference, notes } = params;
  
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  const previousStock = product.currentStock;
  const adjustment = newStock - previousStock;

  // Update product
  product.currentStock = newStock;
  product.lastStockUpdate = new Date();
  product.lastUpdatedBy = adjustedBy;
  await product.save();

  // Create movement record
  const movement = new StockMovement({
    product: productId,
    type,
    quantity: Math.abs(adjustment),
    reference,
    notes,
    previousStock,
    newStock,
    adjustedBy
  });
  await movement.save();

  return {
    product,
    movement,
    adjustment
  };
}

export async function getStockHistory(productId: string, limit: number = 50) {
  return await StockMovement.find({ product: productId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('product', 'name sku unit');
}

export async function getRecentStockMovements(limit: number = 20) {
  return await StockMovement.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('product', 'name sku unit category');
}