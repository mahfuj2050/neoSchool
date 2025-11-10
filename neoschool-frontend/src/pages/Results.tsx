import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/config';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '../services/api/axiosConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Download } from 'lucide-react';
import * as resultService from '@/services/resultService';

const Results = () => {
  const [activeTab, setActiveTab] = useState('tabulation');
  const [formData, setFormData] = useState({
    educationYear: new Date().getFullYear().toString(),
    exam: '',
    class: '',
    student: ''
  });

  const [exams, setExams] = useState<{value: string; label: string}[]>([]);
  interface StudentOption {
    value: string;
    label: string;
    roll: string;
    className: string;
  }

  const [students, setStudents] = useState<{studentId: string; name: string; rollNo: string; studentClass: string}[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<{studentId: string; name: string; rollNo: string; studentClass: string} | null>(null);
  const [loading, setLoading] = useState({
    exams: false,
    students: false,
    generating: false,
    tabulationLoading: false
  });

  // Generate individual years from 2025 to 2035
  const examYears = Array.from({ length: 11 }, (_, i) => (2025 + i).toString());

  // Class list in Bengali
  const classes = [
    'First',
    'Second',
    'Third',
    'Fourth',
    'Fifth'
  ];
  
  const downloadTabulationSheet = async () => {
    if (!formData.exam || !formData.class) return;
    
    try {
      setLoading(prev => ({ ...prev, tabulationLoading: true }));
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const response = await api.get(
        `${API_ENDPOINTS.RESULTS.TABULATION}?examId=${formData.exam}&class=${formData.class}&year=${formData.educationYear}`,
        { 
          responseType: 'blob',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      
      // Get the filename from the response headers or use a default name
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'tabulation-sheet.xlsx';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch != null && filenameMatch[1]) { 
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      toast.success('Tabulation sheet downloaded successfully');
    } catch (error) {
      console.error('Error downloading tabulation sheet:', error);
      toast.error('Failed to download tabulation sheet. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, tabulationLoading: false }));
    }
  };

  // Filter and map students data for display
  const studentOptions = React.useMemo(() => {
    return students
      .filter(student => !formData.class || student.studentClass === formData.class)
      .map(student => ({
        value: student.studentId,
        label: student.name,
        roll: student.rollNo,
        className: student.studentClass
      }));
  }, [students, formData.class]);
  
  // Fetch exams from API
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(prev => ({ ...prev, exams: true }));
        
        const response = await api.get(API_ENDPOINTS.EXAMS.BASE);
        
        const examOptions = Array.isArray(response.data) 
          ? response.data.map((exam: any) => ({
              value: exam.examId,  // Using examId as value for better identification
              label: exam.examName
            }))
          : [];
        
        setExams(examOptions);
      } catch (error) {
        console.error('Error fetching exams:', error);
        toast.error('Failed to load exam options. Please try again.');
      } finally {
        setLoading(prev => ({ ...prev, exams: false }));
      }
    };
    
    fetchExams();

    const fetchStudents = async () => {
      try {
        setLoading(prev => ({ ...prev, students: true }));
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(API_ENDPOINTS.STUDENTS.BASE, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch students');
        
        const data = await response.json();
        setStudents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load student options');
      } finally {
        setLoading(prev => ({ ...prev, students: false }));
      }
    };

    fetchExams();
    fetchStudents();
  }, []);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Reset student if class changes
      if (name === 'class') {
        newData.student = '';
        setSelectedStudent(null);
      }
      
      return newData;
    });
    
    if (name === 'student' && value) {
      const student = students.find(s => s.studentId === value) || null;
      setSelectedStudent(student);
    }
  };

  const handleGenerate = async (type: string) => {
    try {
      setLoading(prev => ({ ...prev, generating: true }));
      
      const { educationYear, exam: examId, class: className, student } = formData;
      
      if (!examId || !className) {
        throw new Error('Please select both exam and class');
      }
      
      if (type === 'marksheet' && !student) {
        throw new Error('Please select a student for mark sheet generation');
      }
      
      // Get the selected exam's name from the exams list
      const selectedExam = exams.find(e => e.value === examId);
      if (!selectedExam) {
        throw new Error('Selected exam not found');
      }
      const examName = selectedExam.label;
      
      let result;
      const filename = `${type}_${className}_${examName}_${new Date().getTime()}`;
      
      switch (type) {
        case 'tabulation':
          result = await resultService.generateTabulationSheet({ 
            educationYear, 
            className, 
            examName 
          });
          break;
          
        case 'merit':
          result = await resultService.generateMeritList({ 
            educationYear, 
            className, 
            examName 
          });
          break;
          
        case 'marksheet':
          if (!student) return;
          result = await resultService.generateMarkSheet({ 
            educationYear, 
            className, 
            examName, 
            studentId: student 
          });
          break;
          
        default:
          throw new Error('Invalid report type');
      }
      
      // Download the PDF
      resultService.downloadPdf(result, filename);
      
      toast.success(`${type.replace(/^\w/, c => c.toUpperCase())} generated successfully`);
      
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to generate ${type}`);
    } finally {
      setLoading(prev => ({ ...prev, generating: false }));
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 text-black">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold">Results Management</h1>
        <p className="text-blue-100">Generate and manage examination results</p>
      </div>
      
      <Tabs defaultValue="tabulation" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-50 p-1.5 rounded-lg gap-1.5">
          <TabsTrigger 
            value="tabulation" 
            onClick={() => setActiveTab('tabulation')}
            className={cn(
              'data-[state=active]:bg-blue-600 data-[state=active]:text-white',
              'data-[state=active]:shadow-sm rounded-md py-3 px-4 transition-colors',
              'data-[state=inactive]:bg-orange-100 data-[state=inactive]:text-orange-800',
              'hover:bg-orange-50 text-base h-auto min-h-[48px] flex items-center justify-center'
            )}
          >
            Tabulation Sheet
          </TabsTrigger>
          <TabsTrigger 
            value="merit" 
            onClick={() => setActiveTab('merit')}
            className={cn(
              'data-[state=active]:bg-blue-600 data-[state=active]:text-white',
              'data-[state=active]:shadow-sm rounded-md py-3 px-4 transition-colors',
              'data-[state=inactive]:bg-sky-100 data-[state=inactive]:text-sky-800',
              'hover:bg-sky-50 text-base h-auto min-h-[48px] flex items-center justify-center'
            )}
          >
            Merit List
          </TabsTrigger>
          <TabsTrigger 
            value="marksheet" 
            onClick={() => setActiveTab('marksheet')}
            className={cn(
              'data-[state=active]:bg-blue-600 data-[state=active]:text-white',
              'data-[state=active]:shadow-sm rounded-md py-3 px-4 transition-colors',
              'data-[state=inactive]:bg-orange-100 data-[state=inactive]:text-orange-800',
              'hover:bg-orange-50 text-base h-auto min-h-[48px] flex items-center justify-center'
            )}
          >
            Mark Sheet
          </TabsTrigger>
        </TabsList>

        {/* Tabulation Sheet Tab */}
        <TabsContent value="tabulation">
          <Card>
            <CardHeader>
              <CardTitle>Generate Tabulation Sheet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Education Year</label>
                  <Select 
                    value={formData.educationYear} 
                    onValueChange={(value) => handleInputChange('educationYear', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      <div className="grid grid-cols-1 gap-1 p-1">
                        {examYears.map((year) => (
                          <SelectItem 
                            key={year} 
                            value={year}
                            className="text-center py-2 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <span className="text-base font-medium text-black">{year}</span>
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Select Exam</label>
                  <Select 
                    value={formData.exam} 
                    onValueChange={(value) => handleInputChange('exam', value)}
                    disabled={loading.exams}
                  >
                    <SelectTrigger>
                      {loading.exams ? (
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading exams...
                        </div>
                      ) : (
                        <SelectValue placeholder="Select Exam" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map((exam) => (
                        <SelectItem key={exam.value} value={exam.value}>
                          {exam.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Select Class</label>
                  <Select 
                    value={formData.class} 
                    onValueChange={(value) => handleInputChange('class', value)}
                  >
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="শ্রেণি নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent className="text-right">
                      {classes.map((cls) => (
                        <SelectItem 
                          key={cls} 
                          value={cls}
                          className="justify-end"
                        >
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleGenerate('tabulation')}
                  disabled={!formData.exam || !formData.class || loading.generating}
                >
                  {loading.generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Generate Tabulation Sheet
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Merit List Tab */}
        <TabsContent value="merit">
          <Card>
            <CardHeader>
              <CardTitle>Generate Merit List</CardTitle>
              <p className="text-sm text-black mt-1">
                Generate and download the merit list for the selected class and exam
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-black">Academic Year</label>
                  <Select
                    value={formData.educationYear}
                    onValueChange={(value) => handleInputChange('educationYear', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Academic Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {examYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-black">Exam Name</label>
                  <Select
                    value={formData.exam}
                    onValueChange={(value) => handleInputChange('exam', value)}
                    disabled={loading.exams}
                  >
                    <SelectTrigger>
                      {loading.exams ? (
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading exams...
                        </div>
                      ) : (
                        <SelectValue placeholder="Select Exam" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map((exam) => (
                        <SelectItem key={exam.value} value={exam.value}>
                          {exam.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-black">Class</label>
                  <Select
                    value={formData.class}
                    onValueChange={(value) => handleInputChange('class', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-4">
                <Button
                  onClick={downloadTabulationSheet}
                  disabled={!formData.exam || !formData.class || loading.tabulationLoading}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-md flex items-center space-x-2 transition-colors"
                >
                  {loading.tabulationLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating Tabulation Sheet...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Download Tabulation Sheet</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleGenerate('merit')}
                  disabled={!formData.exam || !formData.class || loading.generating}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center space-x-2 transition-colors"
                >
                  {loading.generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating Merit List...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Download Merit List (PDF)</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-100">
                <h4 className="text-sm font-medium text-black mb-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Note
                </h4>
                <p className="text-sm text-black">
                  The merit list will be generated as a PDF file containing the top 10 students from the selected class and exam, ranked by their total marks.
                  The PDF will automatically download to your device when ready.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mark Sheet Tab */}
        <TabsContent value="marksheet">
          <Card>
            <CardHeader>
              <CardTitle>Generate Mark Sheet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Education Year</label>
                  <Select 
                    value={formData.educationYear} 
                    onValueChange={(value) => handleInputChange('educationYear', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      <div className="grid grid-cols-1 gap-1 p-1">
                        {examYears.map((year) => (
                          <SelectItem 
                            key={year} 
                            value={year}
                            className="text-center py-2 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <span className="text-base font-medium text-black">{year}</span>
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Select Exam</label>
                  <Select 
                    value={formData.exam} 
                    onValueChange={(value) => handleInputChange('exam', value)}
                    disabled={loading.exams}
                  >
                    <SelectTrigger>
                      {loading.exams ? (
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading exams...
                        </div>
                      ) : (
                        <SelectValue placeholder="Select Exam" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map((exam) => (
                        <SelectItem key={exam.value} value={exam.value}>
                          {exam.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Select Class</label>
                  <Select 
                    value={formData.class} 
                    onValueChange={(value) => handleInputChange('class', value)}
                  >
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="শ্রেণি নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent className="text-right">
                      {classes.map((cls) => (
                        <SelectItem 
                          key={cls} 
                          value={cls}
                          className="justify-end"
                        >
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Select Student</label>
                  <Select 
                    value={formData.student} 
                    onValueChange={(value) => handleInputChange('student', value)}
                    disabled={loading.students}
                  >
                    <SelectTrigger className="w-full">
                      {loading.students ? (
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading students...
                        </div>
                      ) : (
                        <SelectValue placeholder="Select Student" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {studentOptions.map((student) => (
                        <SelectItem 
                          key={student.value} 
                          value={student.value}
                          className="py-2"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-black">{student.label}</span>
                            <div className="flex justify-between text-xs">
                              <span className="text-black">Roll: {student.roll}</span>
                              <span className="text-black">Class: {student.className}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Student List Table */}
                  {students.length > 0 && (
                    <div className="mt-4 border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-3 border-b">
                        <h3 className="font-medium text-sm">Student List</h3>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {studentOptions.map((student) => (
                              <tr 
                                key={student.value}
                                className={`hover:bg-gray-50 cursor-pointer ${formData.student === student.value ? 'bg-blue-50' : ''}`}
                                onClick={() => handleInputChange('student', student.value)}
                              >
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {student.label}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {student.roll}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {student.className}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleGenerate('marksheet')}
                  disabled={!formData.student || !formData.exam || !formData.class || loading.generating}
                >
                  {loading.generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Generate Mark Sheet
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Results;
