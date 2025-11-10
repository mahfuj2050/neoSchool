// src/components/dashboard/StatsCards.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, BookOpen } from 'lucide-react';
import { fetchDashboardStats } from '../../services/dashboardService';

const StatsCards = () => {
  console.log('🔵 StatsCards component rendering...');
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 useEffect triggered');
    let isMounted = true; // To prevent state updates after component unmounts

    const loadStats = async () => {
      console.log('⏳ Loading stats...');
      setLoading(true);
      try {
        const data = await fetchDashboardStats();
        console.log('Stats data received:', data);
        if (isMounted) {
          setStats(data);
          setError(null);
        }
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        if (isMounted) {
          setError('Failed to load dashboard data. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      isMounted = false; // Cleanup function
    };
  }, []);

  const statsData = [
    {
      title: 'Total Students',
      value: stats.totalStudents.toString(),
      active: stats.totalStudents,
      inactive: 0,
      trend: '+0%',
      trendUp: true,
      icon: Users,
      image: '👨‍🎓'
    },
    {
      title: 'Total Teachers',
      value: stats.totalTeachers.toString(),
      active: stats.totalTeachers,
      inactive: 0,
      trend: '+0%',
      trendUp: true,
      icon: UserCheck,
      image: '👨‍🏫'
    },
    {
      title: 'Total Exams',
      value: '0',
      active: 0,
      inactive: 0,
      trend: '0%',
      trendUp: false,
      icon: BookOpen,
      image: '📝'
    },
    {
      title: 'Total Subjects',
      value: '0',
      active: 0,
      inactive: 0,
      trend: '0%',
      trendUp: false,
      icon: BookOpen,
      image: '📚'
    }
  ];

  if (loading) {
    return <div className="text-center py-8">Loading statistics...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>{error}</p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <Card key={index} className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="text-2xl">{stat.image}</div>
              <Badge 
                variant={stat.trendUp ? "default" : "destructive"} 
                className={`${stat.trendUp ? 'bg-green-500' : 'bg-red-500'} text-white`}
              >
                {stat.trend}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.title}</div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                <span>Active: <span className="font-medium text-gray-700">{stat.active}</span></span>
                <span>Inactive: <span className="font-medium text-gray-700">{stat.inactive}</span></span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;