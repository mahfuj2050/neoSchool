import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "../styles/print.css";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Printer, ArrowLeft, School, Award, BookOpen, User, Calendar, Hash, Percent, Trophy, Book, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/config';
import { api } from '@/services/authService';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// Grading scale for reference
const GRADING_SCALE = [
  { range: '80-100', grade: 'A+', gpa: '5.00', remark: 'Outstanding' },
  { range: '70-79', grade: 'A', gpa: '4.00', remark: 'Excellent' },
  { range: '60-69', grade: 'A-', gpa: '3.50', remark: 'Very Good' },
  { range: '50-59', grade: 'B', gpa: '3.00', remark: 'Good' },
  { range: '40-49', grade: 'C', gpa: '2.00', remark: 'Satisfactory' },
  { range: '33-39', grade: 'D', gpa: '1.00', remark: 'Pass' },
  { range: '0-32', grade: 'F', gpa: '0.00', remark: 'Fail' },
];

interface ExamMarks {
  id: number;
  studentId: number;
  studentName: string;
  className: string;
  classRoll: number;
  examName: string;
  examDate: string;
  // Subject fields
  bnSubCode?: string;
  banglaCa?: number;
  banglaAa?: number;
  banglaTotal?: number;
  enSubCode?: string;
  englishCa?: number;
  englishAa?: number;
  englishTotal?: number;
  maSubCode?: string;
  mathCa?: number;
  mathAa?: number;
  mathTotal?: number;
  scSubCode?: string;
  scienceCa?: number;
  scienceAa?: number;
  scienceTotal?: number;
  bwpSubCode?: string;
  bwpCa?: number;
  bwpAa?: number;
  bwpTotal?: number;
  ismSubCode?: string;
  islamCa?: number;
  islamAa?: number;
  islamTotal?: number;
  hinSubCode?: string;
  hinduCa?: number;
  hinduAa?: number;
  hinduTotal?: number;
  sssSubCode?: string;
  sssCa?: number;
  sssAa?: number;
  ssTotal?: number;
  musSubCode?: string;
  musicPhyCa?: number;
  musicPhyAa?: number;
  musicTotal?: number;
  artSubCode?: string;
  artCraftCa?: number;
  artCraftAa?: number;
  artTotal?: number;
  faSubCode?: string;
  fineArtCa?: number;
  fineArtAa?: number;
  faTotal?: number;
  phySubCode?: string;
  phyEduCa?: number;
  phyEduAa?: number;
  phyTotal?: number;
  totalMarks?: number;
  obtainedMarks?: number;
  mainSubjectTotal?: number;
  mainSubjectObtained?: number;
  marksPercentage?: number;
  averageMarks?: number;
  grandePoint?: number;
  gradeLetter?: string;
  remarks?: string;
}

const ViewExamMarks: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: examMarks, isLoading, error } = useQuery<ExamMarks>({
    queryKey: ['examMarks', id],
    queryFn: async () => {
      const response = await api.get(`${API_ENDPOINTS.EXAM_MARKS?.BASE || '/api/exam-marks'}/${id}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Loading Exam Marks...</h2>
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Error</h2>
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="text-red-500 p-4 bg-red-50 rounded-md">
            {error instanceof Error ? error.message : 'Failed to load exam marks'}
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!examMarks) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Not Found</h2>
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p>No exam marks found with the provided ID.</p>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  // Fixed full marks for the exam
  const fullMarks = 450;

  const renderSubjectRow = (
    code: string | undefined,
    name: string,
    ca: number | undefined,
    aa: number | undefined,
    total: number | undefined
  ) => {
    if (!code) return null;
    
    return (
      <tr key={code} className="border-b">
        <td className="p-2 font-medium text-black">{code}</td>
        <td className="p-2 text-black">{name}</td>
        <td className="p-2 text-center text-black">{ca?.toFixed(2) || '-'}</td>
        <td className="p-2 text-center text-black">{aa?.toFixed(2) || '-'}</td>
        <td className="p-2 text-center font-medium text-black">
          {total?.toFixed(2) || (ca !== undefined && aa !== undefined ? (ca + aa).toFixed(2) : '-')}
        </td>
      </tr>
    );
  };

  // Use values from the API response
  const totalObtained = examMarks?.obtainedMarks || 0;
  const totalPossible = examMarks?.totalMarks || 0;
  const overallPercentage = examMarks?.marksPercentage || 0;
  const overallGrade = {
    grade: examMarks?.gradeLetter || '',
    gpa: examMarks?.grandePoint?.toFixed(2) || '0.00',
    remark: examMarks?.remarks || ''
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 p-4 print:p-0 print:bg-white overflow-x-auto print:overflow-visible">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl mx-auto my-0 print:shadow-none print:rounded-none print:my-0 text-black">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-800 to-blue-700 text-white z-20 px-8 py-6 print:relative">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-2 rounded-full">
                <School className="h-10 w-10 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">কাগাপাশা সরকারি প্রাথমিক বিদ্যালয়</h1>
                <p className="text-blue-100 text-sm md:text-base">কাগাপাশা-৩৩৫০, বানিয়াচং, হবিগঞ্জ</p>
                <p className="text-xs md:text-sm text-blue-200">ই-মেইল: info@school.edu.bd | ফোন: +৮৮০ ২-৯৮৭৬৫৪৩</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="text-white hover:bg-blue-700 print:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-blue-50 border-l-4 border-blue-500">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2 text-blue-700">
                  <User className="h-5 w-5" />
                  <CardTitle className="text-lg">Student Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="flex items-center text-sm">
                  <span className="w-24 font-medium flex items-center">
                    <Hash className="h-3.5 w-3.5 mr-1" /> ID:
                  </span>
                  <span className="font-medium">{examMarks?.studentId || 'N/A'}</span>
                </p>
                <p className="flex items-center text-sm">
                  <span className="w-24 font-medium flex items-center">
                    <User className="h-3.5 w-3.5 mr-1" /> Name:
                  </span>
                  <span className="font-medium">{examMarks?.studentName || 'N/A'}</span>
                </p>
                <p className="flex items-center text-sm">
                  <span className="w-24 font-medium flex items-center">
                    <School className="h-3.5 w-3.5 mr-1" /> Class:
                  </span>
                  <span className="font-medium">{examMarks?.className || 'N/A'}</span>
                </p>
                <p className="flex items-center text-sm">
                  <span className="w-24 font-medium flex items-center">
                    <Hash className="h-3.5 w-3.5 mr-1" /> Roll:
                  </span>
                  <span className="font-medium">{examMarks?.classRoll || 'N/A'}</span>
                </p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-l-4 border-green-500">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2 text-green-700">
                  <BookOpen className="h-5 w-5" />
                  <CardTitle className="text-lg">Exam Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="flex items-center text-sm">
                  <span className="w-24 font-medium flex items-center">
                    <Book className="h-3.5 w-3.5 mr-1" /> Exam:
                  </span>
                  <span className="font-medium">{examMarks?.examName || 'N/A'}</span>
                </p>
                <p className="flex items-center text-sm">
                  <span className="w-24 font-medium flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" /> Date:
                  </span>
                  <span>{examMarks?.examDate ? new Date(examMarks.examDate).toLocaleDateString() : 'N/A'}</span>
                </p>
                <p className="flex items-center text-sm">
                  <span className="w-24 font-medium flex items-center">
                    <Award className="h-3.5 w-3.5 mr-1" /> Obtained:
                  </span>
                  <span className="font-medium">{totalObtained.toFixed(2)}</span>
                </p>
                <p className="flex items-center text-sm">
                  <span className="w-24 font-medium flex items-center">
                    <Trophy className="h-3.5 w-3.5 mr-1" /> Total:
                  </span>
                  <span className="font-medium">{examMarks?.totalMarks?.toFixed(2) || '0.00'}</span>
                </p>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-l-4 border-amber-500">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2 text-amber-700">
                  <Award className="h-5 w-5" />
                  <CardTitle className="text-lg">Result Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="flex items-center text-sm">
                  <span className="w-24 font-medium flex items-center">
                    <Percent className="h-3.5 w-3.5 mr-1" /> Percentage:
                  </span>
                  <span className="font-bold text-blue-600">{overallPercentage.toFixed(2)}%</span>
                </p>
                <p className="flex items-center text-sm">
                  <span className="w-24 font-medium">Grade:</span>
                  <span className={`font-bold ${
                    overallGrade.grade === 'A+' ? 'text-blue-700' :
                    overallGrade.grade === 'A' ? 'text-green-700' :
                    overallGrade.grade === 'A-' ? 'text-teal-700' :
                    overallGrade.grade === 'B' ? 'text-yellow-700' :
                    overallGrade.grade === 'C' ? 'text-amber-700' :
                    overallGrade.grade === 'D' ? 'text-orange-700' : 'text-red-700'
                  }`}>
                    {overallGrade.grade} ({overallGrade.gpa})
                  </span>
                </p>
                <p className="flex items-center text-sm">
                  <span className="w-24 font-medium">Status:</span>
                  <span className="font-medium text-green-600 flex items-center">
                    {overallGrade.remark}
                    <CheckCircle className="h-4 w-4 ml-1 text-green-500" />
                  </span>
                </p>
                <p className="flex items-center text-sm">
                  <span className="w-24 font-medium">Position:</span>
                  <span className="font-medium">-</span>
                </p>
              </CardContent>
            </Card>

            <div className="lg:col-span-3">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="bg-blue-50 border-b py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-blue-800">
                      <BookOpen className="inline h-5 w-5 mr-2" />
                      Subject-wise Marks
                    </CardTitle>
                    <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      Full Marks: {totalPossible}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Subject</th>
                      <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-24">CA</th>
                      <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-24">AA</th>
                      <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-24">Total</th>
                      <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-24">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      // Bangla
                      { code: examMarks.bnSubCode || 'BAN', name: 'Bangla', ca: examMarks.banglaCa, aa: examMarks.banglaAa, total: examMarks.banglaTotal },
                      // English
                      { code: examMarks.enSubCode || 'ENG', name: 'English', ca: examMarks.englishCa, aa: examMarks.englishAa, total: examMarks.englishTotal },
                      // Mathematics
                      { code: examMarks.maSubCode || 'MATH', name: 'Mathematics', ca: examMarks.mathCa, aa: examMarks.mathAa, total: examMarks.mathTotal },
                      // Science
                      { code: examMarks.scSubCode || 'SCI', name: 'Science', ca: examMarks.scienceCa, aa: examMarks.scienceAa, total: examMarks.scienceTotal },
                      // Bangladesh & World
                      { code: examMarks.bwpSubCode || 'BWP', name: 'Bangladesh & World', ca: examMarks.bwpCa, aa: examMarks.bwpAa, total: examMarks.bwpTotal },
                      // Islam
                      examMarks.islamTotal !== undefined ? 
                        { code: examMarks.ismSubCode || 'REL', name: 'Islam', ca: examMarks.islamCa, aa: examMarks.islamAa, total: examMarks.islamTotal } : null,
                      // Hindu
                      examMarks.hinduTotal !== undefined ? 
                        { code: examMarks.hinSubCode || 'HIN', name: 'Hindu', ca: examMarks.hinduCa, aa: examMarks.hinduAa, total: examMarks.hinduTotal } : null,
                      // Social Science
                      examMarks.ssTotal !== undefined ? 
                        { code: examMarks.sssSubCode || 'SS', name: 'Social Science', ca: examMarks.sssCa, aa: examMarks.sssAa, total: examMarks.ssTotal } : null,
                      // Music
                      examMarks.musicTotal !== undefined ? 
                        { code: examMarks.musSubCode || 'MUS', name: 'Music', ca: examMarks.musicPhyCa, aa: examMarks.musicPhyAa, total: examMarks.musicTotal } : null,
                      // Art
                      examMarks.artTotal !== undefined ? 
                        { code: examMarks.artSubCode || 'ART', name: 'Art', ca: examMarks.artCraftCa, aa: examMarks.artCraftAa, total: examMarks.artTotal } : null,
                      // Fine Arts
                      examMarks.faTotal !== undefined ? 
                        { code: examMarks.faSubCode || 'FA', name: 'Fine Arts', ca: examMarks.fineArtCa, aa: examMarks.fineArtAa, total: examMarks.faTotal } : null,
                      // Physical Education
                      examMarks.phyTotal !== undefined ? 
                        { code: examMarks.phySubCode || 'PE', name: 'Physical Education', ca: examMarks.phyEduCa, aa: examMarks.phyEduAa, total: examMarks.phyTotal } : null
                    ].filter(Boolean).map((subject, index) => {
                      if (!subject) return null;
                      const percentage = fullMarks > 0 ? ((subject.total || 0) / fullMarks) * 100 : 0;
                      // Use the grade letter from the backend if available, otherwise fall back to the first matching grade
                      const grade = examMarks?.gradeLetter 
                        ? { grade: examMarks.gradeLetter, gpa: examMarks.grandePoint?.toFixed(2) || '0.00' }
                        : { grade: 'N/A', gpa: '0.00' };
                      
                      return (
                        <tr key={subject.code} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="p-3 text-sm">
                            <div className="font-medium text-gray-900">{subject.name}</div>
                            <div className="text-xs text-gray-500">{subject.code}</div>
                          </td>
                          <td className="p-3 text-sm text-center">
                            <span className="px-2 py-1 bg-blue-50 text-blue-800 rounded-full text-xs font-medium">
                              {subject.ca?.toFixed(2) || '0.00'}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-center">
                            <span className="px-2 py-1 bg-green-50 text-green-800 rounded-full text-xs font-medium">
                              {subject.aa?.toFixed(2) || '0.00'}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-center font-medium">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              subject.total && subject.total >= fullMarks * 0.8 ? 'bg-purple-100 text-purple-800' :
                              subject.total && subject.total >= fullMarks * 0.6 ? 'bg-blue-100 text-blue-800' :
                              subject.total && subject.total >= fullMarks * 0.4 ? 'bg-green-100 text-green-800' :
                              subject.total && subject.total >= fullMarks * 0.33 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {(subject.total || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              grade.grade === 'A+' ? 'bg-blue-100 text-blue-800' :
                              grade.grade === 'A' ? 'bg-green-100 text-green-800' :
                              grade.grade === 'A-' ? 'bg-teal-100 text-teal-800' :
                              grade.grade === 'B' ? 'bg-yellow-100 text-yellow-800' :
                              grade.grade === 'C' ? 'bg-amber-100 text-amber-800' :
                              grade.grade === 'D' ? 'bg-orange-100 text-orange-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {grade.grade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Grading Scale Card */}
          <div className="mt-6">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-amber-50 border-b py-3">
                <div className="flex items-center space-x-2 text-amber-700">
                  <Award className="h-5 w-5" />
                  <CardTitle className="text-lg">Grading Scale</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2">
                  {GRADING_SCALE.map((item, index) => (
                    <div key={index} className="text-center p-2 border rounded">
                      <div className="font-semibold">{item.grade}</div>
                      <div className="text-sm text-gray-600">{item.range}%</div>
                      <div className="text-xs text-gray-500">GPA: {item.gpa}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Remarks Section */}
          {examMarks.remarks && (
            <Card className="mt-6">
              <CardHeader className="bg-blue-50 border-b py-3">
                <div className="flex items-center space-x-2 text-blue-700">
                  <Book className="h-5 w-5" />
                  <CardTitle className="text-lg">Teacher's Remarks</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <p className="italic">"{examMarks.remarks}"</p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-2 w-full">
            <Button variant="outline" onClick={() => window.print()} className="print:hidden">
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
            <Button onClick={() => navigate(-1)} className="print:hidden">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </div>
        </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ViewExamMarks;
