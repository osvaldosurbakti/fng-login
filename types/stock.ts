// types/stock.ts
export type ProductUnit = "pcs" | "pack" | "box" | "kg" | "gram" | "ml" | "botol" | "sachet";

export interface StockProduct {
  _id: string;
  name: string;
  price: number;
  category: "makanan" | "minuman";
  sku: string; // Ubah dari optional menjadi required
  unit: ProductUnit; // Pastikan ini sesuai
  currentStock: number;
  minimumStock: number;
  isTrackStock: boolean;
  lowStockAlert: boolean;
  isAvailable: boolean;
}

export interface StockMovement {
  _id: string;
  type: 'in' | 'out' | 'adjustment' | 'initial';
  quantity: number;
  reference?: string;
  notes?: string;
  previousStock: number;
  newStock: number;
  adjustedBy: string;
  createdAt: string;
  product: {
    name: string;
    sku: string;
    unit: string;
  };
}