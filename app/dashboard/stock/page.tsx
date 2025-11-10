// app/dashboard/stock/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import StockTable from "@/components/stock/StockTable";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

async function getProducts() {
  await connectDB();
  
  try {
    const products = await Product.find({})
      .sort({ 
        lowStockAlert: -1,  // Low stock items first
        currentStock: 1,    // Then by stock quantity
        category: 1, 
        name: 1 
      })
      .lean();
    
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function StockManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!["superadmin", "admin"].includes(session.user?.role || "")) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-red-500 text-center sm:text-left">Access denied. Admin role required.</p>
      </div>
    );
  }

  const products = await getProducts();

  // Calculate stats untuk stock
  const lowStockItems = products.filter((p: { lowStockAlert: any; isTrackStock: any; }) => p.lowStockAlert && p.isTrackStock);
  const outOfStockItems = products.filter((p: { currentStock: number; isTrackStock: any; }) => p.currentStock === 0 && p.isTrackStock);
  const totalStockValue = products.reduce((sum: number, product: { isTrackStock?: boolean; currentStock?: number; price?: number }) => {
    if (product?.isTrackStock) {
      const stock = Number(product.currentStock || 0);
      const price = Number(product.price || 0);
      return sum + (stock * price);
    }
    return sum;
  }, 0);

  const stats = {
    totalItems: products.length,
    lowStock: lowStockItems.length,
    outOfStock: outOfStockItems.length,
    totalValue: totalStockValue,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 max-w-xl">
            Monitor inventory levels, track stock movements, and manage restocking
          </p>
        </div>
      </div>

      {/* Stats Cards - Improved mobile layout */}
      <div className="w-full">
        {/* Mobile: compact grid layout */}
        <div className="md:hidden grid grid-cols-2 gap-3">
          {/* Total Items */}
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Total Items</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {stats.totalItems}
                </p>
              </div>
              <div className="p-1.5 bg-blue-50 rounded-lg flex-shrink-0 ml-2">
                <ClipboardDocumentListIcon className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Low Stock</p>
                <p className={`text-lg font-bold mt-1 ${
                  stats.lowStock > 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {stats.lowStock}
                </p>
              </div>
              <div className={`p-1.5 rounded-lg flex-shrink-0 ml-2 ${
                stats.lowStock > 0 ? 'bg-red-50' : 'bg-green-50'
              }`}>
                <svg className={`w-4 h-4 ${stats.lowStock > 0 ? 'text-red-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Out of Stock */}
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Out of Stock</p>
                <p className={`text-lg font-bold mt-1 ${
                  stats.outOfStock > 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {stats.outOfStock}
                </p>
              </div>
              <div className={`p-1.5 rounded-lg flex-shrink-0 ml-2 ${
                stats.outOfStock > 0 ? 'bg-red-50' : 'bg-green-50'
              }`}>
                <svg className={`w-4 h-4 ${stats.outOfStock > 0 ? 'text-red-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Value */}
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Total Value</p>
                <p className="text-xs font-bold text-gray-900 mt-1 truncate">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
              <div className="p-1.5 bg-purple-50 rounded-lg flex-shrink-0 ml-2">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 6v1m0-1v1m0-1h-1m1 0h1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: grid layout */}
        <div className="hidden md:grid md:grid-cols-4 gap-4">
          {/* Total Items */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalItems}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className={`text-2xl font-bold mt-1 ${
                  stats.lowStock > 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {stats.lowStock}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${
                stats.lowStock > 0 ? 'bg-red-50' : 'bg-green-50'
              }`}>
                <svg className={`w-6 h-6 ${stats.lowStock > 0 ? 'text-red-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Out of Stock */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className={`text-2xl font-bold mt-1 ${
                  stats.outOfStock > 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {stats.outOfStock}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${
                stats.outOfStock > 0 ? 'bg-red-50' : 'bg-green-50'
              }`}>
                <svg className={`w-6 h-6 ${stats.outOfStock > 0 ? 'text-red-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Value */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 6v1m0-1v1m0-1h-1m1 0h1" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar for Mobile */}
      <div className="md:hidden bg-blue-50 rounded-lg p-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-blue-700 font-medium">Quick Stats:</span>
          <div className="flex space-x-2">
            <span className="bg-white px-2 py-1 rounded border border-blue-200">
              Low: {stats.lowStock}
            </span>
            <span className="bg-white px-2 py-1 rounded border border-blue-200">
              Out: {stats.outOfStock}
            </span>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <StockTable products={products} />
      </div>

      {/* Mobile Help Text */}
      <div className="md:hidden bg-gray-50 rounded-lg p-3">
        <p className="text-xs text-gray-600 text-center">
          💡 Scroll horizontally to see all table columns
        </p>
      </div>
    </div>
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