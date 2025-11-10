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
  DocumentTextIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  QueueListIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    roles: ["superadmin", "admin"],
    mobileLabel: "Home"
  },
  {
    name: "Menu Management",
    href: "/dashboard/menu",
    icon: QueueListIcon,
    roles: ["superadmin", "admin"],
    mobileLabel: "Menu"
  },
  {
    name: "Stock Management", 
    href: "/dashboard/stock",
    icon: ClipboardDocumentListIcon,
    roles: ["superadmin", "admin"],
    mobileLabel: "Stock"
  },
  {
    name: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingBagIcon,
    roles: ["superadmin", "admin"],
    mobileLabel: "Orders"
  },
  {
    name: "User Management",
    href: "/dashboard/users",
    icon: UserGroupIcon,
    roles: ["superadmin"],
    mobileLabel: "Users"
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: ChartBarIcon,
    roles: ["superadmin", "admin"],
    mobileLabel: "Reports"
  },
  {
    name: "Activity Logs",
    href: "/dashboard/logs",
    icon: DocumentTextIcon,
    roles: ["superadmin"],
    mobileLabel: "Logs"
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: CogIcon,
    roles: ["superadmin"],
    mobileLabel: "Settings"
  },
];

interface DashboardSidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export default function DashboardSidebar({ isMobileOpen, onMobileClose }: DashboardSidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const filteredNavigation = navigation.filter(item =>
    item.roles.includes(session?.user?.role || "")
  );

  // Close mobile sidebar when route changes
  const handleNavigation = () => {
    onMobileClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar - Mobile Drawer & Desktop Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 bg-white shadow-xl lg:shadow-lg h-screen flex flex-col
      `}>
        {/* Header with Close Button (Mobile) */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between lg:justify-center">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FNG</span>
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">
              FNG System
            </span>
          </div>
          
          {/* Close button - mobile only */}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavigation}
                className={`
                  flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors
                  min-h-11 lg:min-h-12
                  ${isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                <item.icon className="h-5 w-5 mr-3 shrink-0" />
                {/* Show full name on desktop, short name on mobile */}
                <span className="hidden lg:inline">{item.name}</span>
                <span className="lg:hidden">{item.mobileLabel}</span>
                
                {/* Active indicator dot for mobile */}
                {isActive && (
                  <div className="ml-auto lg:hidden">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info Section */}
        <div className="p-4 border-t border-gray-200 bg-white mt-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0">
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
          
          {/* Mobile-only quick action */}
          <div className="mt-3 lg:hidden">
            <div className="text-xs text-gray-400 text-center">
              FNG Admin System v1.0.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
}