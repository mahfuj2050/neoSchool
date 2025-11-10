import React, { ReactNode, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import TopHeader from './layout/TopHeader';
import Sidebar from './layout/Sidebar';

// Set default zoom level to 75%
const DEFAULT_ZOOM_LEVEL = 0.80;

interface AppLayoutProps {
  children?: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { sidebarOpen, sidebarCollapsed, toggleSidebar } = useAppContext();
  const isMobile = useIsMobile();

  // Set initial zoom level and handle cleanup
  useEffect(() => {
    // Set initial zoom level
    document.body.style.zoom = `${DEFAULT_ZOOM_LEVEL * 100}%`;
    
    // Add/remove overflow-hidden class to body when sidebar is open on mobile
    if (isMobile && sidebarOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    // Cleanup function
    return () => {
      document.body.style.zoom = '';
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMobile, sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopHeader />
      <div className="flex">
        <Sidebar />
        <main 
          className={`flex-1 transition-all duration-300 ease-in-out ${
            !isMobile && sidebarCollapsed ? '!ml-[0.5rem]' : '!ml-[0.5rem]'
          } !pt-4`}
          style={{
            marginLeft: '0.5rem',
            paddingTop: '1rem',
            zoom: 1
          }}
        >
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
