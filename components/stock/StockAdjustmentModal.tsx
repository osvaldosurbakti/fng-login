// components/stock/StockAdjustmentModal.tsx
"use client";

import { useState, useEffect } from "react";

interface Product {
  _id: string;
  name: string;
  currentStock: number;
  unit?: "pcs" | "pack" | "box" | "kg" | "gram" | "ml" | "botol" | "sachet";
  minimumStock?: number; // Tambahkan ini
  isTrackStock?: boolean; // Tambahkan ini
}

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

type AdjustmentType = "set" | "add" | "subtract";

export default function StockAdjustmentModal({ isOpen, onClose, product }: StockAdjustmentModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>("set");
  const [quantity, setQuantity] = useState(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (product && isOpen) {
      setQuantity(product.currentStock);
      setNotes("");
      setMessage({ type: "", text: "" });
      setAdjustmentType("set");
    }
  }, [product, isOpen]);

  const calculateNewStock = () => {
    if (!product) return 0;

    switch (adjustmentType) {
      case "set":
        return quantity;
      case "add":
        return product.currentStock + quantity;
      case "subtract":
        return product.currentStock - quantity;
      default:
        return product.currentStock;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const newStock = calculateNewStock();
      
      if (newStock < 0) {
        setMessage({ type: "error", text: "Stock cannot be negative" });
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/admin/products/${product._id}/stock`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newStock,
          adjustmentType,
          quantity,
          notes: notes.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Stock updated successfully!" });
        
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1000);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update stock" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  const newStock = calculateNewStock();
  const stockChange = newStock - product.currentStock;

  return (
    // overlay: click di area overlay akan menutup modal (tetap ignore klik di konten)
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center p-0 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-hidden={false}
    >
      {/* Container: bottom sheet on mobile, centered panel on md+ */}
      <div
        role="dialog"
        aria-modal="true"
        className="w-full md:max-w-md lg:max-w-lg bg-white rounded-t-lg md:rounded-lg shadow-xl max-h-[90vh] overflow-hidden"
        // on small screens make it act like bottom sheet
        style={{ margin: "0 0 0 0" }}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            Adjust Stock - {product.name}
          </h2>
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

        {/* Scrollable content */}
        <form onSubmit={handleSubmit} className="overflow-auto max-h-[70vh] p-4 space-y-4">
          {/* Current Stock Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Current Stock</div>
            <div className="text-lg font-semibold text-gray-900">
              {product.currentStock} {product.unit || ""}
            </div>
          </div>

          {/* Adjustment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adjustment Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType("set")}
                className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                  adjustmentType === "set"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Set To
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType("add")}
                className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                  adjustmentType === "add"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType("subtract")}
                className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                  adjustmentType === "subtract"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Subtract
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity {adjustmentType !== "set" && `to ${adjustmentType}`}
            </label>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={0}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Preview New Stock */}
          <div className={`p-3 rounded-lg border ${
            stockChange > 0 
              ? 'bg-green-50 border-green-200' 
              : stockChange < 0 
                ? 'bg-red-50 border-red-200' 
                : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="text-sm text-gray-600">New Stock Will Be</div>
            <div className={`text-lg font-semibold ${
              stockChange > 0 ? 'text-green-700' : stockChange < 0 ? 'text-red-700' : 'text-gray-900'
            }`}>
              {newStock} {product.unit || ""}
            </div>
            {stockChange !== 0 && (
              <div className={`text-sm ${ stockChange > 0 ? 'text-green-600' : 'text-red-600' }`}>
                {stockChange > 0 ? '+' : ''}{stockChange} from current
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Reason for stock adjustment..."
            />
          </div>

          {message.text && (
            <div
              className={`p-3 rounded ${
                message.type === "success"
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Actions: stacked on mobile, inline on md+ */}
          <div className="flex flex-col-reverse md:flex-row md:justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full md:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}