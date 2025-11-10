// components/layout/DashboardHeader.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function DashboardHeader() {
  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsProfileOpen(false);
    if (isProfileOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileOpen]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Page Title - Compact on mobile */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
              FNG Admin System
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 truncate">
              Welcome back, {session?.user?.name || session?.user?.email}
            </p>
          </div>

          {/* User Menu - Optimized for mobile */}
          <div className="relative ml-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsProfileOpen(!isProfileOpen);
              }}
              className="flex items-center space-x-2 sm:space-x-3 text-sm focus:outline-none min-h-11 min-w-11"
              aria-label="User menu"
            >
              {/* Hide name on small mobile, show on larger screens */}
              <div className="hidden sm:block text-right">
                <p className="font-medium text-gray-900 text-sm truncate max-w-[120px]">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-gray-500 capitalize text-xs">
                  {session?.user?.role}
                </p>
              </div>
              
              {/* Avatar */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-semibold text-xs sm:text-sm">
                  {(session?.user?.name?.[0] || session?.user?.email?.[0] || "U").toUpperCase()}
                </span>
              </div>
            </button>

            {/* Dropdown Menu - Mobile optimized */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session?.user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {session?.user?.email}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 capitalize">
                    {session?.user?.role}
                  </p>
                </div>
                
                {/* Sign out button */}
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
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