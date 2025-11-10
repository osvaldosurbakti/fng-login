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
      <div className="p-6">
        <p className="text-red-500">Access denied. Admin role required.</p>
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600 mt-1">
            Manage product information, pricing, and availability for customers
          </p>
        </div>
      </div>

      {/* Stats Cards - Focus on Menu */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Menu Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.totalProducts}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <QueueListIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Food Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.makanan}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Drink Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.minuman}
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.available}
              </p>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Table - Focus on Customer-facing Info */}
      <MenuTable products={products} />
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