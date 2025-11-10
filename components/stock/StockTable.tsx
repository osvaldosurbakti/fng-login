// components/stock/StockTable.tsx
"use client";

import { useState } from "react";
import StockAdjustmentModal from "./StockAdjustmentModal";
import BulkStockUpdateModal from "./BulkStockUpdateModal";
import { ProductUnit } from "@/models/Product"; // Import the type


interface Product {
  _id: string;
  name: string;
  price: number;
  category: "makanan" | "minuman";
  sku?: string;
  unit?: ProductUnit;  // Use the specific type
  currentStock: number;
  minimumStock: number;
  isTrackStock: boolean;
  lowStockAlert: boolean;
  isAvailable: boolean;
}

interface StockTableProps {
  products: Product[];
}

export default function StockTable({ products }: StockTableProps) {
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filter, setFilter] = useState<"all" | "low-stock" | "out-of-stock" | "no-tracking">("all");

  const handleAdjustStock = (product: Product) => {
    setSelectedProduct(product);
    setIsAdjustmentModalOpen(true);
  };

  const handleBulkUpdate = () => {
    setIsBulkModalOpen(true);
  };

  const handleToggleStockTracking = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isTrackStock: !currentStatus
        }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update stock tracking");
      }
    } catch (error) {
      alert("An error occurred while updating stock tracking");
    }
  };

  // Filter products berdasarkan kondisi stok
  const filteredProducts = products.filter(product => {
    switch (filter) {
      case "low-stock":
        return product.lowStockAlert && product.isTrackStock;
      case "out-of-stock":
        return product.currentStock === 0 && product.isTrackStock;
      case "no-tracking":
        return !product.isTrackStock;
      default:
        return true;
    }
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStockStatusColor = (product: Product) => {
    if (!product.isTrackStock) {
      return "bg-gray-100 text-gray-800";
    }
    
    if (product.currentStock === 0) {
      return "bg-red-100 text-red-800";
    }
    
    if (product.lowStockAlert) {
      return "bg-yellow-100 text-yellow-800";
    }
    
    return "bg-green-100 text-green-800";
  };

  const getStockStatusText = (product: Product) => {
    if (!product.isTrackStock) {
      return "No Tracking";
    }
    
    if (product.currentStock === 0) {
      return "Out of Stock";
    }
    
    if (product.lowStockAlert) {
      return "Low Stock";
    }
    
    return "In Stock";
  };

  const calculateStockValue = (product: Product) => {
    return product.currentStock * product.price;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Table Header dengan Filter */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center space-x-4 w-full">
              <h2 className="text-lg font-semibold text-gray-900">Inventory</h2>

              {/* Filter Buttons: overflow-x on mobile */}
              <div className="flex-1 overflow-x-auto">
                <div className="flex space-x-2 min-w-max">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                      filter === "all" 
                        ? "bg-blue-100 text-blue-800 border border-blue-200" 
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    All ({products.length})
                  </button>
                  <button
                    onClick={() => setFilter("low-stock")}
                    className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                      filter === "low-stock" 
                        ? "bg-yellow-100 text-yellow-800 border border-yellow-200" 
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Low Stock ({products.filter(p => p.lowStockAlert && p.isTrackStock).length})
                  </button>
                  <button
                    onClick={() => setFilter("out-of-stock")}
                    className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                      filter === "out-of-stock" 
                        ? "bg-red-100 text-red-800 border border-red-200" 
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Out of Stock ({products.filter(p => p.currentStock === 0 && p.isTrackStock).length})
                  </button>
                  <button
                    onClick={() => setFilter("no-tracking")}
                    className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                      filter === "no-tracking" 
                        ? "bg-gray-100 text-gray-800 border border-gray-200" 
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    No Tracking ({products.filter(p => !p.isTrackStock).length})
                  </button>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <button
                onClick={handleBulkUpdate}
                className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Bulk Update</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Table (md+) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr 
                  key={product._id} 
                  className={`hover:bg-gray-50 ${
                    product.lowStockAlert && product.isTrackStock ? 'bg-yellow-50' : ''
                  } ${
                    product.currentStock === 0 && product.isTrackStock ? 'bg-red-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">
                      {product.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.sku || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${
                        product.isTrackStock 
                          ? product.currentStock === 0 
                            ? 'text-red-600' 
                            : product.lowStockAlert 
                              ? 'text-yellow-600' 
                              : 'text-green-600'
                          : 'text-gray-600'
                      }`}>
                        {product.isTrackStock ? product.currentStock : 'N/A'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {product.unit || ""}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.isTrackStock ? product.minimumStock : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(product)}`}>
                      {getStockStatusText(product)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.isTrackStock ? formatPrice(calculateStockValue(product)) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleAdjustStock(product)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      Adjust
                    </button>
                    <button
                      onClick={() => handleToggleStockTracking(product._id, product.isTrackStock)}
                      className={product.isTrackStock ? "text-orange-600 hover:text-orange-900" : "text-green-600 hover:text-green-900"}
                    >
                      {product.isTrackStock ? 'Disable Tracking' : 'Enable Tracking'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List (sm) */}
        <div className="md:hidden px-4 py-3">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  <div className="text-xs text-gray-500 capitalize mt-1">{product.category} • {product.sku || "-"}</div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(product)}`}>
                    {getStockStatusText(product)}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700">
                <div>
                  <div className="text-xs text-gray-500">Stock</div>
                  <div className={`font-medium ${product.isTrackStock ? '' : 'text-gray-500'}`}>
                    {product.isTrackStock ? `${product.currentStock} ${product.unit || ""}` : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Min</div>
                  <div className="font-medium">{product.isTrackStock ? product.minimumStock : '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Value</div>
                  <div className="font-medium">{product.isTrackStock ? formatPrice(calculateStockValue(product)) : '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Price</div>
                  <div className="font-medium">{formatPrice(product.price)}</div>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <button
                  onClick={() => handleAdjustStock(product)}
                  className="w-full text-left bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100"
                >
                  Adjust Stock
                </button>
                <button
                  onClick={() => handleToggleStockTracking(product._id, product.isTrackStock)}
                  className={`w-full px-3 py-2 rounded-md text-sm font-medium ${
                    product.isTrackStock ? 'bg-orange-50 text-orange-700 hover:bg-orange-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {product.isTrackStock ? 'Disable Tracking' : 'Enable Tracking'}
                </button>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === "all" 
                  ? "Get started by adding products to your inventory." 
                  : `No products match the "${filter}" filter.`}
              </p>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {filteredProducts.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-600 space-y-2 sm:space-y-0">
              <span>
                Showing {filteredProducts.length} of {products.length} products
              </span>
              <span>
                Total Inventory Value: {formatPrice(
                  filteredProducts.reduce((sum, product) => 
                    sum + (product.isTrackStock ? calculateStockValue(product) : 0), 0
                  )
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <StockAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        product={selectedProduct}
      />

      <BulkStockUpdateModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        products={products.filter(p => p.isTrackStock)}
      />
    </>
  );
}

// ClipboardDocumentListIcon component
function ClipboardDocumentListIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}