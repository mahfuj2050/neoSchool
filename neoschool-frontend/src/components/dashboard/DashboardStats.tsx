import React from 'react';
import StatCard from './StatCard';
import { Users, GraduationCap, BookOpen, TrendingUp } from 'lucide-react';

const DashboardStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Total Students"
        value="1,234"
        icon={Users}
        trend="+12% from last month"
        trendUp={true}
      />
      <StatCard
        title="Total Teachers"
        value="87"
        icon={GraduationCap}
        trend="+3% from last month"
        trendUp={true}
      />
      <StatCard
        title="Total Classes"
        value="42"
        icon={BookOpen}
        trend="No change"
        trendUp={false}
      />
      <StatCard
        title="Attendance Rate"
        value="91.2%"
        icon={TrendingUp}
        trend="+2.1% from last month"
        trendUp={true}
      />
    </div>
  );
};

export default DashboardStats;