// components/layout/DashboardSidebar.tsx
"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  CogIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    roles: ["superadmin", "admin"],
  },
  {
    name: "User Management",
    href: "/dashboard/users",
    icon: UserGroupIcon,
    roles: ["superadmin"],
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: ChartBarIcon,
    roles: ["superadmin", "admin"],
  },
  {
    name: "Activity Logs",
    href: "/dashboard/logs",
    icon: DocumentTextIcon,
    roles: ["superadmin"],
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: CogIcon,
    roles: ["superadmin"],
  },
];

export default function DashboardSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const filteredNavigation = navigation.filter(item =>
    item.roles.includes(session?.user?.role || "")
  );

  return (
    <div className="w-64 bg-white shadow-lg">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">FNG</span>
          </div>
          <span className="ml-3 text-xl font-bold text-gray-900">
            FNG System
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Info Section */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {(session?.user?.name?.[0] || session?.user?.email?.[0] || "U").toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500 capitalize truncate">
              {session?.user?.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}