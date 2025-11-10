// components/menu/MenuTable.tsx
"use client";

import { useState } from "react";
import ProductModal from "@/components/menu/ProductModal";
import { QueueListIcon } from "@heroicons/react/24/outline";

interface Product {
  _id: string;
  name: string;
  price: number;
  category: "makanan" | "minuman";
  description?: string;
  isAvailable: boolean;
  image?: string;
  
  // Stock fields - tambahkan semua yang diperlukan
  sku?: string;
  unit?: "pcs" | "pack" | "box" | "kg" | "gram" | "ml" | "botol";
  currentStock?: number;
  minimumStock?: number;
  isTrackStock?: boolean;
  lowStockAlert?: boolean;
}

interface MenuTableProps {
  products: Product[];
}

export default function MenuTable({ products }: MenuTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [action, setAction] = useState<"create" | "edit">("create");

  const handleCreate = () => {
    setSelectedProduct(null);
    setAction("create");
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setAction("edit");
    setIsModalOpen(true);
  };

  const handleToggleAvailability = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isAvailable: !currentStatus
        }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update product");
      }
    } catch (error) {
      alert("An error occurred while updating product");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getCategoryBadgeColor = (category: string) => {
    return category === "makanan" 
      ? "bg-orange-100 text-orange-800" 
      : "bg-blue-100 text-blue-800";
  };

  const getStockBadge = (product: Product) => {
    if (!product.isTrackStock) return null;
    
    if (product.currentStock === 0) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Out of Stock</span>;
    }
    
    if (product.currentStock && product.currentStock <= 10) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Low Stock</span>;
    }
    
    return <span className="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">In Stock</span>;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Menu Items</h2>
            <button
              onClick={handleCreate}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Menu Item</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        {product.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getCategoryBadgeColor(product.category)}`}>
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4">
                    {getStockBadge(product)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.isAvailable 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {product.isAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleAvailability(product._id, product.isAvailable)}
                      className={product.isAvailable ? "text-orange-600 hover:text-orange-900" : "text-green-600 hover:text-green-900"}
                    >
                      {product.isAvailable ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="text-center py-12">
              <QueueListIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No menu items</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first menu item.</p>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        action={action}
      />
    </>
  );
}