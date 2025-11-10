// components/stock/StockHistoryModal.tsx
"use client";

import { useState, useEffect } from 'react';
import { StockProduct, StockMovement } from '@/types/stock'; // Import dari types yang konsisten


interface StockHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: StockProduct | null; // Gunakan StockProduct yang konsisten
}

export default function StockHistoryModal({ isOpen, onClose, product }: StockHistoryModalProps) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      fetchStockHistory();
    } else {
      setMovements([]);
    }
  }, [isOpen, product]);

  const fetchStockHistory = async () => {
    if (!product) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/products/${product._id}/stock-history`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMovements(data.data);
        }
      } else {
        console.error('Failed to fetch stock history');
      }
    } catch (error) {
      console.error('Error fetching stock history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'in': return 'bg-green-100 text-green-800';
      case 'out': return 'bg-red-100 text-red-800';
      case 'adjustment': return 'bg-blue-100 text-blue-800';
      case 'initial': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMovementTypeText = (type: string) => {
    switch (type) {
      case 'in': return 'Stock In';
      case 'out': return 'Stock Out';
      case 'adjustment': return 'Adjustment';
      case 'initial': return 'Initial Stock';
      default: return type;
    }
  };

  const getAdjustmentSign = (type: string, quantity: number) => {
    switch (type) {
      case 'in': return `+${quantity}`;
      case 'out': return `-${quantity}`;
      case 'adjustment': return `±${quantity}`;
      case 'initial': return `+${quantity}`;
      default: return quantity.toString();
    }
  };

  const getAdjustmentColor = (type: string) => {
    switch (type) {
      case 'in': return 'text-green-600';
      case 'out': return 'text-red-600';
      case 'adjustment': return 'text-blue-600';
      case 'initial': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Stock History - {product?.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                SKU: {product?.sku} • Unit: {product?.unit}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : movements.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No stock history</h3>
              <p className="mt-1 text-sm text-gray-500">
                No stock movements recorded for this product yet.
              </p>
            </div>
          ) : (
            <div className="overflow-auto h-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Previous Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      New Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Adjustment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Adjusted By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movements.map((movement) => (
                    <tr key={movement._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(movement.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${getMovementTypeColor(movement.type)}`}>
                          {getMovementTypeText(movement.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movement.previousStock} {product?.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movement.newStock} {product?.unit}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getAdjustmentColor(movement.type)}`}>
                        {getAdjustmentSign(movement.type, movement.quantity)} {product?.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movement.adjustedBy}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={movement.notes}>
                          {movement.notes || '-'}
                        </div>
                        {movement.reference && (
                          <div className="text-xs text-gray-500 mt-1">
                            Ref: {movement.reference}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {loading ? 'Loading...' : `Showing ${movements.length} stock movements`}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={fetchStockHistory}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}