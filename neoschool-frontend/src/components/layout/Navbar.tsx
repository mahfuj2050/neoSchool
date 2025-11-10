import React from 'react';
import {
  Menu, Bell, MessageSquare, ChevronDown, Search, BarChart3, Maximize, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';

const Navbar: React.FC = () => {
  const { toggleSidebar } = useAppContext();

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleSidebar();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 overflow-visible">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between h-16">
        
        {/* Left side - Menu button and Logo */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMenuClick}
            className="mr-2 text-gray-600 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo + Text */}
          <div className="flex items-center space-x-2">
            <img
              src="/src/assets/logo.jpg"
              alt="NeoSchool Logo"
              className="w-8 h-8 object-cover rounded"
            />
            <span className="text-xl font-semibold text-blue-600 tracking-wide">
              NeoSchool
            </span>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side - Academic year, flag, icons, user */}
        <div className="flex items-center space-x-4">

          {/* Academic Year Selector */}
          <div className="flex items-center space-x-1 border border-gray-300 rounded-md px-3 py-1">
            <span className="text-sm text-gray-600">Academic Year:</span>
            <span className="text-sm font-medium">2024 / 2025</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>

          {/* Country Flag */}
          <div className="flex items-center">
            <div className="w-6 h-4 rounded-sm overflow-hidden">
              <img
                src="https://flagcdn.com/w20/us.png"
                alt="US Flag"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Notification Icons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:bg-gray-100 rounded-full p-2 relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100 rounded-full p-2">
              <MessageSquare className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100 rounded-full p-2">
              <BarChart3 className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100 rounded-full p-2">
              <Maximize className="h-5 w-5" />
            </Button>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-blue-600 hover:bg-blue-700 rounded-sm flex items-center justify-center"
            >
              <User className="h-5 w-5 text-white" />
            </Button>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
