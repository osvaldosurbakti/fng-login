// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import AddAdminForm from "@/components/AddAdminForm";
import StatsCards from "@/components/StatsCards";

// Mock data untuk stats - nanti bisa diganti dengan data real
const mockStats = {
  totalUsers: 24,
  totalAdmins: 3,
  activeSessions: 12,
  todayLogs: 156,
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user?.role !== "superadmin") {
    return (
      <div className="p-6">
        <p className="text-red-500">Access denied. Superadmin role required.</p>
      </div>
    );
  }

  return (
    // container responsif dan terpusat
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-linear-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Welcome back, {session.user?.name}!
        </h1>
        <p className="opacity-90">
          Here's what's happening with your system today.
        </p>
      </div>

      {/* Stats Cards - scrollable on mobile, grid on desktop */}
      <div className="overflow-x-auto">
        {/* berikan min-width agar card bisa discroll di layar sangat kecil */}
        <div className="min-w-[640px]">
          <StatsCards stats={mockStats} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {/* Add Admin Form */}
        <AddAdminForm />

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          {/* responsive grid: 1 kolom mobile, 2 kolom sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">View All Users</div>
              <div className="text-sm text-gray-600">Manage all system users</div>
            </button>

            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">System Reports</div>
              <div className="text-sm text-gray-600">Generate usage reports</div>
            </button>

            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">Backup Data</div>
              <div className="text-sm text-gray-600">Create system backup</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}