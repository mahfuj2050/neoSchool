import React from 'react';
import GradeDistributionChart from './GradeDistributionChart';
import AttendanceChart from './AttendanceChart';
import AdmissionsChart from './AdmissionsChart';
import SubjectMarksChart from './SubjectMarksChart';

const DashboardCharts: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* First row - Pie and Bar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GradeDistributionChart />
        <AttendanceChart />
      </div>
      
      {/* Second row - Line and Area charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdmissionsChart />
        <SubjectMarksChart />
      </div>
    </div>
  );
};

export default DashboardCharts;