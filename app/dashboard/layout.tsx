// app/dashboard/layout.tsx
import DashboardHeader from "@/components/layout/DashboardHeader";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashboardFooter from "@/components/layout/DashboardFooter";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
        
        {/* Footer */}
        <DashboardFooter />
      </div>
    </div>
  );
}