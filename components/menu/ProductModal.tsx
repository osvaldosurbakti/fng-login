// components/products/ProductModal.tsx
"use client";

import { useState, useEffect } from "react";
import ImageUpload from "./ImageUpload";

// Import the type from the model or define it here
type ProductUnit = "pcs" | "pack" | "box" | "kg" | "gram" | "ml" | "botol";

interface Product {
  _id: string;
  name: string;
  price: number;
  category: "makanan" | "minuman";
  description?: string;
  isAvailable: boolean;
  image?: string;
  
  // Stock fields
  sku?: string;
  unit?: ProductUnit;  // Use the specific type
  currentStock?: number;
  minimumStock?: number;
  isTrackStock?: boolean;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  action: "create" | "edit";
}

export default function ProductModal({ isOpen, onClose, product, action }: ProductModalProps) {
  const [formData, setFormData] = useState({
    // Basic info
    name: "",
    price: 0,
    category: "minuman" as "makanan" | "minuman",
    description: "",
    isAvailable: true,
    image: "",
    
    // Stock management - use ProductUnit type
    sku: "",
    unit: "pcs" as ProductUnit,
    currentStock: 0,
    minimumStock: 5,
    isTrackStock: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (product && action === "edit") {
      setFormData({
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description || "",
        isAvailable: product.isAvailable,
        image: product.image || "",
        
        // Stock fields - ensure unit is of type ProductUnit
        sku: product.sku || "",
        unit: product.unit || "pcs",
        currentStock: product.currentStock || 0,
        minimumStock: product.minimumStock || 5,
        isTrackStock: product.isTrackStock !== undefined ? product.isTrackStock : true,
      });
    } else {
      setFormData({
        name: "",
        price: 0,
        category: "minuman",
        description: "",
        isAvailable: true,
        image: "",
        
        // Stock fields dengan default values
        sku: "",
        unit: "pcs",
        currentStock: 0,
        minimumStock: 5,
        isTrackStock: true,
      });
    }
    setMessage({ type: "", text: "" });
  }, [product, action, isOpen]);

  // Update handleChange to properly handle select for unit
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "number") {
      setFormData({
        ...formData,
        [name]: Number(value),
      });
    } else if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else if (name === "unit") {
      // Specifically handle unit with proper type casting
      setFormData({
        ...formData,
        [name]: value as ProductUnit,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image: imageUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Validation
    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "Product name is required" });
      setLoading(false);
      return;
    }

    if (formData.price <= 0) {
      setMessage({ type: "error", text: "Price must be greater than 0" });
      setLoading(false);
      return;
    }

    try {
      const url = action === "create" 
        ? "/api/admin/products" 
        : `/api/admin/products/${product?._id}`;
      
      const method = action === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: "success", 
          text: action === "create" 
            ? "Product created successfully!" 
            : "Product updated successfully!" 
        });
        
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.error || "Operation failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {action === "create" ? "Add New Product" : "Edit Product"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Basic Information */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (IDR) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter price"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="minuman">Minuman</option>
                  <option value="makanan">Makanan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product description (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image
                </label>
                <ImageUpload 
                  onImageUpload={handleImageUpload}
                  currentImage={formData.image}
                />
              </div>
            </div>
          </div>

          {/* Stock Management */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Stock Management</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isTrackStock"
                  checked={formData.isTrackStock}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Track stock for this product
                </label>
              </div>

              {formData.isTrackStock && (
                <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU (Auto-generated if empty)
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Leave empty for auto-generation"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pcs">Pieces (pcs)</option>
                      <option value="pack">Pack</option>
                      <option value="box">Box</option>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="gram">Gram</option>
                      <option value="ml">Milliliter (ml)</option>
                      <option value="botol">Bottle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Stock
                    </label>
                    <input
                      type="number"
                      name="currentStock"
                      value={formData.currentStock}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Stock (Alert Level)
                    </label>
                    <input
                      type="number"
                      name="minimumStock"
                      value={formData.minimumStock}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Product is available for sale
            </label>
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

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Processing..." : action === "create" ? "Create Product" : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}