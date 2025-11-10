import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { gradeDistribution } from '@/data/mockData';

const GradeDistributionChart: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Distribution by Grade</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={gradeDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ grade, students }) => `${grade}: ${students}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="students"
            >
              {gradeDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default GradeDistributionChart;