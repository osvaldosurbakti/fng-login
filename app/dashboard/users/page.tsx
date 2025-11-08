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
      <div className="p-6">
        <p className="text-red-500">Access denied. Superadmin role required.</p>
      </div>
    );
  }

  const users = await getUsers();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage all users in the system
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {users.length}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admin Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {users.filter(user => user.role === 'admin').length}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Regular Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {users.filter(user => user.role === 'user').length}
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <UsersTable users={users} />
    </div>
  );
}