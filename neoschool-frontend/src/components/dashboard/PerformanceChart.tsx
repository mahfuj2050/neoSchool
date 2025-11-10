import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChevronDown } from 'lucide-react';

const PerformanceChart: React.FC = () => {
  const performanceData = [
    { name: 'Top', value: 45, color: '#3b82f6' },
    { name: 'Average', value: 11, color: '#fbbf24' },
    { name: 'Below Avg', value: 2, color: '#ef4444' }
  ];

  const total = performanceData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Performance</CardTitle>
          <div className="flex items-center space-x-1 text-sm text-gray-600 cursor-pointer">
            <span>Class II</span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {/* Legend */}
          <div className="space-y-4">
            {performanceData.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-lg font-semibold text-gray-900 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Donut Chart */}
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={45}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;