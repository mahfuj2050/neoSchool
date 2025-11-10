import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import CategoryCards from './CategoryCards';
import StatsCards from './StatsCards';
import PerformanceChart from './PerformanceChart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  // Student distribution data
  const gradeData = [
    { name: 'Grade 9', value: 4, color: '#3b82f6' },
    { name: 'Grade 10', value: 5, color: '#10b981' },
    { name: 'Grade 11', value: 3, color: '#f59e0b' },
    { name: 'Grade 12', value: 3, color: '#ef4444' }
  ];

  // Attendance data
  const attendanceData = [
    { class: '9A', attendance: 95 },
    { class: '9B', attendance: 92 },
    { class: '10A', attendance: 88 },
    { class: '10B', attendance: 94 },
    { class: '11A', attendance: 90 },
    { class: '12A', attendance: 87 }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
            <span>Dashboard</span>
            <span>/</span>
            <span>Admin Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add New Student
          </Button>
          <Button variant="outline">
            Fees Details
          </Button>
        </div>
      </div>

      {/* Category Cards */}
      <CategoryCards />

      {/* Stats Cards */}
      <StatsCards />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Student Distribution Pie Chart */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Student Distribution by Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gradeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {gradeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {gradeData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Bar Chart */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Attendance per Class</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <XAxis dataKey="class" />
                  <YAxis domain={[0, 100]} />
                  <Bar dataKey="attendance" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Section */}
      <PerformanceChart />
    </div>
  );
};

export default Dashboard;