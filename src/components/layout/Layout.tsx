import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to open

  const toggleSidebar = () => {
    // Only allow toggle on mobile (below lg breakpoint)
    if (window.innerWidth < 1024) {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const closeSidebar = () => {
    // Only allow close on mobile
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Handle window resize to ensure sidebar is always open on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true); // Always open on desktop
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <Header onMenuToggle={toggleSidebar} isSidebarOpen={sidebarOpen} />

      <div className="flex pt-16">
        {/* Sidebar - Always visible on desktop, toggle on mobile */}
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Main Content */}
        <main className="flex-1 transition-all duration-300 lg:ml-80">
          <div className="min-h-[calc(100vh-4rem)] w-full">
            <div className="w-full mx-auto px-0 py-0">
              {children}
            </div>
          </div>
        </main>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={closeSidebar}
          />
        )}
      </div>
    </div>
  );
};

export default Layout;