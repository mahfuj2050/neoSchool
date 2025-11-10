import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { subjectMarks } from '@/data/mockData';

const SubjectMarksChart: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Marks per Subject</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={subjectMarks}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value}%`, 'Average Marks']} />
            <Area 
              type="monotone" 
              dataKey="marks" 
              stroke="#f59e0b" 
              fill="#fbbf24" 
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SubjectMarksChart;