// components/stock/BulkStockUpdateModal.tsx
"use client";

import { useState, useEffect } from "react";

interface Product {
  _id: string;
  name: string;
  sku?: string;
  currentStock: number;
  unit?: "pcs" | "pack" | "box" | "kg" | "gram" | "ml" | "botol";
  category: "makanan" | "minuman";
  minimumStock?: number; // Tambahkan ini
  isTrackStock?: boolean; // Tambahkan ini
}

interface BulkStockUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

type BulkActionType = "set-all" | "add-all" | "restock-all";

export default function BulkStockUpdateModal({ isOpen, onClose, products }: BulkStockUpdateModalProps) {
  const [actionType, setActionType] = useState<BulkActionType>("set-all");
  const [quantity, setQuantity] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchTerm, setSearchTerm] = useState("");

  // Select all products by default
  useEffect(() => {
    if (isOpen) {
      setSelectedProducts(products.map(p => p._id));
      setQuantity(0);
      setMessage({ type: "", text: "" });
    }
  }, [isOpen, products]);

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateNewStock = (product: Product) => {
    switch (actionType) {
      case "set-all":
        return quantity;
      case "add-all":
        return product.currentStock + quantity;
      case "restock-all":
        return product.minimumStock ? product.minimumStock + quantity : quantity;
      default:
        return product.currentStock;
    }
  };

  const getActionDescription = () => {
    switch (actionType) {
      case "set-all":
        return "Set all selected products to this quantity";
      case "add-all":
        return "Add this quantity to current stock of all selected products";
      case "restock-all":
        return "Restock to minimum stock level plus this quantity";
      default:
        return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedProducts.length === 0) {
      setMessage({ type: "error", text: "Please select at least one product" });
      return;
    }

    if (quantity < 0) {
      setMessage({ type: "error", text: "Quantity cannot be negative" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/admin/products/bulk-stock-update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productIds: selectedProducts,
          actionType,
          quantity,
          notes: `Bulk ${actionType} to ${quantity}`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: "success", 
          text: `Successfully updated ${data.updatedCount} products!` 
        });
        
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1200);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update products" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred while updating products" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    // overlay: tap di luar konten (overlay) menutup modal
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center p-4 z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* container: bottom-sheet on mobile, centered panel on md+ */}
      <div className="w-full md:max-w-4xl bg-white rounded-t-lg md:rounded-lg shadow-xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Bulk Stock Update</h2>
            <p className="text-sm text-gray-600">{getActionDescription()}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => { setSearchTerm(""); setSelectedProducts(products.map(p => p._id)); }}
              className="hidden sm:inline text-sm text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body: stacked on mobile, two-column on md+ */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Panel - Configuration (full width on mobile) */}
          <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 p-4 md:p-6 overflow-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Action Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="actionType"
                      value="set-all"
                      checked={actionType === "set-all"}
                      onChange={(e) => setActionType(e.target.value as BulkActionType)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Set to specific quantity</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="actionType"
                      value="add-all"
                      checked={actionType === "add-all"}
                      onChange={(e) => setActionType(e.target.value as BulkActionType)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Add quantity to current stock</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="actionType"
                      value="restock-all"
                      checked={actionType === "restock-all"}
                      onChange={(e) => setActionType(e.target.value as BulkActionType)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Restock to minimum level + quantity</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {getActionDescription()}
                </p>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min={0}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quantity"
                />
              </div>

              {/* Selection Summary */}
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <div className="flex justify-between">
                  <span>Selected</span>
                  <span className="font-medium">{selectedProducts.length} / {products.length}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Action</span>
                  <span className="font-medium capitalize">{actionType.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Qty</span>
                  <span className="font-medium">{quantity}</span>
                </div>
              </div>

              {message.text && (
                <div className={`p-2 rounded ${
                  message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                }`}>
                  {message.text}
                </div>
              )}

              {/* Actions: stacked on mobile, inline on md+ */}
              <div className="flex flex-col md:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full md:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || selectedProducts.length === 0}
                  className="w-full md:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Updating..." : `Update ${selectedProducts.length} Products`}
                </button>
              </div>
            </form>
          </div>

          {/* Right Panel - Product Selection (full width on mobile) */}
          <div className="w-full md:w-2/3 p-4 md:p-6 overflow-auto">
            {/* Search and Select All */}
            <div className="flex items-center justify-between mb-4 space-x-3">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (selectedProducts.length === filteredProducts.length) setSelectedProducts([]);
                  else setSelectedProducts(filteredProducts.map(p => p._id));
                }}
                className="ml-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800"
              >
                {selectedProducts.length === filteredProducts.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            {/* Products List */}
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedProducts.includes(product._id)
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => toggleProductSelection(product._id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product._id)}
                    onChange={() => toggleProductSelection(product._id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />

                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-sm text-gray-500 truncate">SKU: {product.sku || "N/A"} • {product.category}</p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-sm font-medium text-gray-900">Current: {product.currentStock} {product.unit || ""}</p>
                        <p className="text-sm text-gray-500">New: {calculateNewStock(product)} {product.unit || ""}</p>
                      </div>
                    </div>

                    {actionType !== "set-all" && (
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          calculateNewStock(product) > product.currentStock ? "bg-green-100 text-green-800"
                          : calculateNewStock(product) < product.currentStock ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                        }`}>
                          {calculateNewStock(product) > product.currentStock ? "↑" :
                           calculateNewStock(product) < product.currentStock ? "↓" : "="}
                          &nbsp;{Math.abs(calculateNewStock(product) - product.currentStock)} {product.unit || ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? "Try adjusting your search term" : "No products available for bulk update"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}