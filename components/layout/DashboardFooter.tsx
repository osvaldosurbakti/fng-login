// components/layout/DashboardFooter.tsx
export default function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-600">
            © {currentYear} FNG System. All rights reserved.
          </div>
          
          <div className="flex space-x-6 mt-2 md:mt-0">
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Support
            </a>
          </div>
        </div>
        
        <div className="mt-2 text-center md:text-left">
          <p className="text-xs text-gray-400">
            Version 1.0.0 • Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </footer>
  );
}