// app/dashboard/users/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import UsersTable from "@/components/users/UsersTable";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

async function getUsers() {
  await connectDB();
  
  try {
    const users = await User.find({})
      .select("-password") // Exclude password field
      .sort({ createdAt: -1 })
      .lean();
    
    // Convert MongoDB objects to plain objects
    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export default async function UsersManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user?.role !== "superadmin") {
    return (
      <div className="p-4">
        <p className="text-red-500 text-center text-sm sm:text-base">Access denied. Superadmin role required.</p>
      </div>
    );
  }

  const users = await getUsers();

  // Calculate user stats
  const userStats = {
    total: users.length,
    admins: users.filter((user: { role: string; }) => user.role === 'admin').length,
    regular: users.filter((user: { role: string; }) => user.role === 'user').length,
    superadmins: users.filter((user: { role: string; }) => user.role === 'superadmin').length,
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage all users in the system
          </p>
        </div>
        
        {/* Mobile quick stats */}
        <div className="sm:hidden bg-blue-50 rounded-lg p-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-blue-700 font-medium">Quick View:</span>
            <div className="flex space-x-2">
              <span className="bg-white px-2 py-1 rounded border border-blue-200">
                Total: {userStats.total}
              </span>
              <span className="bg-white px-2 py-1 rounded border border-blue-200">
                Admins: {userStats.admins}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Users Card */}
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Users</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">
                {userStats.total}
              </p>
              <p className="text-xs text-gray-500 mt-1 truncate">
                All system users
              </p>
            </div>
            <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg shrink-0 ml-2">
              <UsersIcon className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Admin Users Card */}
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Admin Users</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">
                {userStats.admins}
              </p>
              <p className="text-xs text-gray-500 mt-1 truncate">
                Management access
              </p>
            </div>
            <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg shrink-0 ml-2">
              <AdminIcon className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Regular Users Card */}
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Regular Users</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">
                {userStats.regular}
              </p>
              <p className="text-xs text-gray-500 mt-1 truncate">
                Standard access
              </p>
            </div>
            <div className="p-1.5 sm:p-2 bg-purple-50 rounded-lg shrink-0 ml-2">
              <RegularUserIcon className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Superadmin Stats - Hidden on mobile, shown on desktop */}
      <div className="hidden sm:block">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Superadmins:</span>
                <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  {userStats.superadmins}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Role Distribution:</span>
                <span className="text-sm text-gray-600">
                  {Math.round((userStats.admins / userStats.total) * 100)}% Admin
                </span>
                <span className="text-sm text-gray-600">
                  {Math.round((userStats.regular / userStats.total) * 100)}% Regular
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <UsersTable users={users} />
      </div>

      {/* Mobile Help Text */}
      <div className="sm:hidden bg-blue-50 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <InfoIcon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            💡 Swipe left to see all user details and actions
          </p>
        </div>
      </div>

      {/* Mobile Summary */}
      <div className="sm:hidden bg-gray-50 rounded-lg p-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center">
            <span className="font-medium text-gray-700">Superadmins</span>
            <div className="text-lg font-bold text-yellow-600">{userStats.superadmins}</div>
          </div>
          <div className="text-center">
            <span className="font-medium text-gray-700">Active</span>
            <div className="text-lg font-bold text-green-600">{userStats.total}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Users Icon
function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  );
}

// Admin Icon
function AdminIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

// Regular User Icon
function RegularUserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

// Info Icon
function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}