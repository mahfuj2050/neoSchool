import React from "react";
import {
  Search,
  Calendar,
  Bell,
  MessageSquare,
  BarChart3,
  Settings,
} from "lucide-react";
import UserDropdown from "@/components/UserDropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const TopHeader: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left - Logo + Title */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
            <div className="w-3.5 h-3.5 bg-white rounded-full"></div>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent tracking-tight">
            NeoSchool
          </h1>
        </div>

        {/* Center - Search Bar */}
        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search students, teachers, subjects..."
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-blue-200 transition"
            />
          </div>
        </div>

        {/* Right - Action Controls */}
        <div className="flex items-center space-x-4">
          {/* Academic Year */}
          <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Academic Year: 2024 / 2025</span>
          </div>

          {/* Action Icons */}
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-blue-600">
            <Settings className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-blue-600">
            <BarChart3 className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-blue-600">
            <MessageSquare className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-blue-600">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-[10px] rounded-full">
              1
            </Badge>
          </Button>

          {/* User Menu */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
