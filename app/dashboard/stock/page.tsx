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
      <div className="p-6">
        <p className="text-red-500">Access denied. Admin role required.</p>
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

  return (
    // container padding agar nyaman di device kecil
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600 mt-1">
            Monitor inventory levels, track stock movements, and manage restocking
          </p>
        </div>
      </div>

      {/* Stats Cards - responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.totalItems}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.lowStock}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${stats.lowStock > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <svg className={`w-6 h-6 ${stats.lowStock > 0 ? 'text-red-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.outOfStock}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${stats.outOfStock > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <svg className={`w-6 h-6 ${stats.outOfStock > 0 ? 'text-red-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(stats.totalValue)}
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

      {/* Stock Table - bungkus dengan overflow-x-auto untuk mobile */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <StockTable products={products} />
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