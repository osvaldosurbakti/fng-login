// components/layout/DashboardHeader.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function DashboardHeader() {
  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Page Title - akan diubah berdasarkan halaman aktif */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              FNG Admin System
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Welcome back, {session?.user?.name || session?.user?.email}
            </p>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 text-sm focus:outline-none"
            >
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-gray-500 capitalize">
                  {session?.user?.role}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {(session?.user?.name?.[0] || session?.user?.email?.[0] || "U").toUpperCase()}
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                  Signed in as<br />
                  <span className="font-medium">{session?.user?.email}</span>
                </div>
                
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}