// components/StatsCards.tsx
import {
  UsersIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface StatsCardsProps {
  stats: {
    totalUsers: number;
    totalAdmins: number;
    activeSessions: number;
    todayLogs: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const statItems = [
    {
      name: "Total Users",
      value: stats.totalUsers,
      icon: UsersIcon,
      color: "blue",
    },
    {
      name: "Admin Users",
      value: stats.totalAdmins,
      icon: UserGroupIcon,
      color: "green",
    },
    {
      name: "Active Sessions",
      value: stats.activeSessions,
      icon: ChartBarIcon,
      color: "purple",
    },
    {
      name: "Today's Logs",
      value: stats.todayLogs,
      icon: DocumentTextIcon,
      color: "orange",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <div
          key={item.name}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{item.name}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {item.value}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${colorClasses[item.color as keyof typeof colorClasses]}`}>
              <item.icon className="h-6 w-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}