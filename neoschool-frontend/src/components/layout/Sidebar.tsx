import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  Menu,
  FileBarChart2
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: GraduationCap, label: 'Teachers', path: '/teachers' },
  { icon: Users, label: 'Students', path: '/students' },
  { icon: BookOpen, label: 'Subjects', path: '/subjects' },
  { icon: BookOpen, label: 'Grades', path: '/grades' },
  { icon: BookOpen, label: 'Exams', path: '/exams' },
  { icon: FileText, label: 'Exam Marks', path: '/exam-marks' },
  { icon: FileBarChart2, label: 'Results', path: '/results' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar: React.FC = () => {
  const { 
    sidebarOpen, 
    sidebarCollapsed, 
    toggleSidebar, 
    toggleCollapse 
  } = useAppContext();
  const isMobile = useIsMobile();
  const location = useLocation();

  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      toggleSidebar();
    }
  }, [location.pathname]);

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-16 h-full bg-white border-r border-gray-200 z-50
        transform transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
        lg:translate-x-0 lg:static lg:z-auto lg:top-0
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!sidebarCollapsed && <h2 className="text-lg font-semibold">Menu</h2>}
          <div className="flex items-center space-x-2">
            {!isMobile && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleCollapse}
                className="p-1.5 h-8 w-8"
              >
                {sidebarCollapsed ? (
                  <Menu className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            )}
            {isMobile && (
              <Button variant="ghost" size="sm" onClick={toggleSidebar} className="p-1.5 h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <nav className="p-2">
          {menuItems.map((item, index) => (
            <div key={index} className="px-2 py-1 group">
              <NavLink 
                to={item.path}
                className={({ isActive }) => `flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <item.icon className={`h-5 w-5 ${!sidebarCollapsed ? 'mr-3' : 'mx-auto'}`} />
                {!sidebarCollapsed && item.label}
                {sidebarCollapsed && (
                  <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </NavLink>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;