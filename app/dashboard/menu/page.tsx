// app/dashboard/menu/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import MenuTable from "@/components/menu/MenuTable";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

async function getProducts() {
  await connectDB();
  
  try {
    const products = await Product.find({})
      .sort({ category: 1, name: 1 })
      .lean();
    
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function MenuManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!["superadmin", "admin"].includes(session.user?.role || "")) {
    return (
      <div className="p-4">
        <p className="text-red-500 text-center">Access denied. Admin role required.</p>
      </div>
    );
  }

  const products = await getProducts();

  // Calculate stats untuk menu
  const stats = {
    totalProducts: products.length,
    makanan: products.filter((p: { category: string; }) => p.category === 'makanan').length,
    minuman: products.filter((p: { category: string; }) => p.category === 'minuman').length,
    available: products.filter((p: { isAvailable: any; }) => p.isAvailable).length,
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 max-w-2xl">
            Manage product information, pricing, and availability for customers
          </p>
        </div>
        
        {/* Add spacing for mobile */}
        <div className="sm:h-10"></div>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Menu Items */}
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Items</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">
                {stats.totalProducts}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg shrink-0 ml-2">
              <QueueListIcon className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Food Items */}
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Food</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">
                {stats.makanan}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg shrink-0 ml-2">
              <FoodIcon className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Drink Items */}
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Drinks</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">
                {stats.minuman}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 bg-purple-50 rounded-lg shrink-0 ml-2">
              <DrinkIcon className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Available Items */}
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Available</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">
                {stats.available}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 bg-orange-50 rounded-lg shrink-0 ml-2">
              <AvailableIcon className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Mobile Stats Bar */}
      <div className="sm:hidden bg-blue-50 rounded-lg p-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-blue-700 font-medium">Quick Stats:</span>
          <div className="flex space-x-3 text-xs">
            <span className="bg-white px-2 py-1 rounded border border-blue-200">
              Food: {stats.makanan}
            </span>
            <span className="bg-white px-2 py-1 rounded border border-blue-200">
              Drinks: {stats.minuman}
            </span>
          </div>
        </div>
      </div>

      {/* Menu Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <MenuTable products={products} />
      </div>

      {/* Mobile Bottom Info */}
      <div className="sm:hidden bg-gray-50 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-600">
          💡 Scroll horizontally to see all table columns
        </p>
      </div>
    </div>
  );
}

// QueueListIcon component
function QueueListIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

// Food Icon
function FoodIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// Drink Icon
function DrinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

// Available Icon
function AvailableIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}