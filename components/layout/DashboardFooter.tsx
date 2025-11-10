// components/layout/DashboardFooter.tsx
export default function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-4 safe-area-botton-padding">
      <div className="px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
          <div className="text-sm text-gray-600 text-center md:text-left">
            © {currentYear} FNG System. All rights reserved.
          </div>
          
          {/* Links - Stack on mobile, row on desktop */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:flex-nowrap">
            <a
              href="#"
              className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap"
            >
              Support
            </a>
          </div>
        </div>
        
        {/* Version info - Centered on mobile */}
        <div className="mt-3 text-center md:text-left">
          <p className="text-xs text-gray-400">
            Version 1.0.0 • Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Mobile-only quick links */}
        <div className="mt-3 md:hidden">
          <div className="flex justify-center space-x-4 text-xs text-gray-400">
            <span>Admin System</span>
            <span>•</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}