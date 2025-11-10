// components/stock/BulkStockUpdateModal.tsx
"use client";

import { useState, useEffect } from "react";

interface Product {
  _id: string;
  name: string;
  sku?: string;
  currentStock: number;
  unit?: "pcs" | "pack" | "box" | "kg" | "gram" | "ml" | "botol" | "sachet";
  category: "makanan" | "minuman";
  minimumStock?: number;
  isTrackStock?: boolean;
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
  const [activeTab, setActiveTab] = useState<"config" | "products">("config");

  // Select all products by default
  useEffect(() => {
    if (isOpen) {
      setSelectedProducts(products.map(p => p._id));
      setQuantity(0);
      setMessage({ type: "", text: "" });
      setActiveTab("config");
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
        return "Add this quantity to current stock";
      case "restock-all":
        return "Restock to minimum level plus this quantity";
      default:
        return "";
    }
  };

  const getShortActionDescription = () => {
    switch (actionType) {
      case "set-all":
        return "Set to quantity";
      case "add-all":
        return "Add quantity";
      case "restock-all":
        return "Restock + quantity";
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
          text: `Updated ${data.updatedCount} products successfully!` 
        });
        
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
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
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Mobile: bottom sheet, Desktop: centered panel */}
      <div className="w-full sm:max-w-4xl bg-white rounded-t-2xl sm:rounded-lg shadow-xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Sticky */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">Bulk Stock Update</h2>
            <p className="text-sm text-gray-600 truncate hidden sm:block">{getActionDescription()}</p>
            <p className="text-xs text-gray-500 truncate sm:hidden">
              {selectedProducts.length} selected • {getShortActionDescription()}
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-3">
            <button
              onClick={() => { setSearchTerm(""); setSelectedProducts(products.map(p => p._id)); }}
              className="hidden sm:inline-flex text-sm text-gray-600 px-2 py-1 rounded hover:bg-gray-100 min-h-9"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 min-h-9 min-w-9 flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="sm:hidden border-b border-gray-200 bg-white">
          <div className="flex">
            <button
              onClick={() => setActiveTab("config")}
              className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
                activeTab === "config"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Configuration
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
                activeTab === "products"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Products ({selectedProducts.length})
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col sm:flex-row">
          {/* Configuration Panel */}
          <div className={`w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-gray-200 p-4 sm:p-6 overflow-auto ${
            activeTab === "config" ? "block" : "hidden sm:block"
          }`}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Action Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
                <div className="space-y-2">
                  <label className="flex items-center min-h-11">
                    <input
                      type="radio"
                      name="actionType"
                      value="set-all"
                      checked={actionType === "set-all"}
                      onChange={(e) => setActionType(e.target.value as BulkActionType)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Set to quantity</span>
                  </label>
                  <label className="flex items-center min-h-11">
                    <input
                      type="radio"
                      name="actionType"
                      value="add-all"
                      checked={actionType === "add-all"}
                      onChange={(e) => setActionType(e.target.value as BulkActionType)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Add to current</span>
                  </label>
                  <label className="flex items-center min-h-11">
                    <input
                      type="radio"
                      name="actionType"
                      value="restock-all"
                      checked={actionType === "restock-all"}
                      onChange={(e) => setActionType(e.target.value as BulkActionType)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Restock + quantity</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2 sm:hidden">
                  {getActionDescription()}
                </p>
              </div>

              {/* Quantity Input */}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Enter quantity"
                />
              </div>

              {/* Selection Summary - Compact on mobile */}
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-600">Selected:</span>
                    <span className="font-medium ml-1">{selectedProducts.length}/{products.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Action:</span>
                    <span className="font-medium ml-1 capitalize">{actionType.replace('-', ' ')}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium ml-1">{quantity}</span>
                  </div>
                </div>
              </div>

              {/* Message */}
              {message.text && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.type === "success" 
                    ? "bg-green-50 text-green-800 border border-green-200" 
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}>
                  {message.text}
                </div>
              )}

              {/* Action Buttons - Always visible on mobile */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 min-h-11"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || selectedProducts.length === 0}
                  className="w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 min-h-11 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    `Update ${selectedProducts.length} Products`
                  )}
                </button>
              </div>

              {/* Mobile Navigation Hint */}
              <div className="sm:hidden text-center pt-2">
                <p className="text-xs text-gray-500">
                  💡 Switch to <strong>Products</strong> tab to manage selection
                </p>
              </div>
            </form>
          </div>

          {/* Products Panel */}
          <div className={`w-full sm:w-2/3 p-4 sm:p-6 overflow-auto ${
            activeTab === "products" ? "block" : "hidden sm:block"
          }`}>
            {/* Search and Selection Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedProducts.length === filteredProducts.length) 
                      setSelectedProducts([]);
                    else 
                      setSelectedProducts(filteredProducts.map(p => p._id));
                  }}
                  className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 rounded-lg min-h-9"
                >
                  {selectedProducts.length === filteredProducts.length ? "Deselect All" : "Select All"}
                </button>
              </div>
            </div>

            {/* Selection Summary Bar - Mobile only */}
            <div className="sm:hidden bg-blue-50 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-700 font-medium">
                  {selectedProducts.length} products selected
                </span>
                <span className="text-blue-600">
                  {getShortActionDescription()}
                </span>
              </div>
            </div>

            {/* Products List */}
            <div className="space-y-2">
              {filteredProducts.map((product) => {
                const newStock = calculateNewStock(product);
                const difference = newStock - product.currentStock;
                
                return (
                  <div
                    key={product._id}
                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors min-h-20 ${
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
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />

                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            SKU: {product.sku || "N/A"} • {product.category}
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0 sm:ml-3 sm:text-right">
                          <p className="text-sm font-medium text-gray-900">
                            Current: {product.currentStock} {product.unit || ""}
                          </p>
                          <p className="text-sm text-gray-600">
                            New: {newStock} {product.unit || ""}
                          </p>
                        </div>
                      </div>

                      {/* Difference Indicator */}
                      {actionType !== "set-all" && difference !== 0 && (
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            difference > 0 
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {difference > 0 ? "↑" : "↓"}
                            &nbsp;{Math.abs(difference)} {product.unit || ""}
                            {difference > 0 ? " increase" : " decrease"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? "Try adjusting your search term" : "No products available"}
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Bottom Action Bar */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("config")}
                  className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back to Config
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || selectedProducts.length === 0}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}