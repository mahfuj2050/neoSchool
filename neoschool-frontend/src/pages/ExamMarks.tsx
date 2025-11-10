import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Edit2, Trash2, Loader2, Eye, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { api } from '@/services/authService';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '../config';
import ExamMarksForm from './ExamMarksForm';
import type { FormData, SubjectMarks } from '@/types/examMarks';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ExamMarks {
  id: number;
  studentId: number;
  studentName: string;
  className: string;
  classRoll: number;
  examName: string;
  examDate: string | Date;  // Accept both string and Date types
  totalMarks: number;
  obtainedMarks: number;
  mainSubjectTotal: number;
  mainSubjectObtained: number;
  marksPercentage: number;
  averageMarks: number;
  grandePoint: number;
  gradeLetter: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

const ExamMarksList: React.FC = () => {
  // The api instance already includes the authentication token in its headers
  const [marks, setMarks] = useState<ExamMarks[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMark, setEditingMark] = useState<Partial<FormData> | null>(null);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [grades, setGrades] = useState<Array<{
    gradeLetter: string;
    gradePoint: number;
    rangeMin: number;
    rangeMax: number;
    remarks: string;
  }>>([]);

  // Fetch grades
  const fetchGrades = useCallback(async () => {
    try {
      const response = await api.get(API_ENDPOINTS.GRADES?.BASE || '/api/grades');
      setGrades(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching grades:', err);
      toast.error('Failed to load grade information');
    }
  }, []);

  // Fetch data
  const fetchMarks = useCallback(async () => {
    setLoading(true);
    try {
      const [marksResponse] = await Promise.all([
        api.get(API_ENDPOINTS.EXAM_MARKS?.BASE || '/api/exam-marks'),
        fetchGrades() // Fetch grades in parallel
      ]);

      console.log('API Response:', marksResponse.data);
      const processedMarks = Array.isArray(marksResponse.data) ? marksResponse.data : [];
      console.log('Processed Marks:', processedMarks);
      setMarks(processedMarks);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load exam marks.');
    } finally {
      setLoading(false);
    }
  }, [fetchGrades]);

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await api.get(API_ENDPOINTS.SUBJECTS.BASE);
      setSubjects(Array.isArray(response.data) ? response.data.map((s: any) => ({
        id: String(s.id || s.subjectId),
        name: s.name || s.subjectName,
        marks: s.marks // Include marks from the backend
      })) : []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    }
  }, []);

  // Get grade point for a given percentage
  const getGradePoint = (percentage: number): number | null => {
    const grade = grades.find(g => 
      percentage >= g.rangeMin && percentage <= g.rangeMax
    );
    return grade ? grade.gradePoint : null;
  };

  useEffect(() => {
    fetchMarks();
    fetchSubjects();
  }, [fetchMarks, fetchSubjects]);

  // Filter
  const filteredMarks = marks.filter((m) =>
    m.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.studentId.toString().includes(searchTerm) ||
    m.classRoll.toString().includes(searchTerm)
  );

  const formatDate = (dateInput: string | Date | null | undefined) => {
    console.log('formatDate input:', dateInput, 'type:', typeof dateInput);
    
    if (!dateInput) {
      console.log('Empty or null date input');
      return 'N/A';
    }
    
    try {
      // If it's already a Date object, use it directly, otherwise create a new Date
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date input:', dateInput);
        return 'N/A';
      }
      
      // Format the date as "MMM D, YYYY" (e.g., "Aug 25, 2025")
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC' // Ensure consistent formatting
      };
      
      const formattedDate = date.toLocaleDateString('en-US', options);
      console.log('Formatted date:', formattedDate, 'from input:', dateInput);
      return formattedDate;
      
    } catch (error) {
      console.error('Error formatting date:', error, 'Input:', dateInput);
      return 'N/A';
    }
  };

  const formatNumber = (num: number) => {
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  const handleSave = async (formData: any) => {
    try {
      // Calculate totals and prepare subjects
      const subjects = formData.subjects.map((subject: any) => {
        const caMarks = parseFloat(subject.caMarks) || 0;
        const aaMarks = parseFloat(subject.aaMarks) || 0;
        const totalMarks = caMarks + aaMarks;
        
        return {
          subjectCode: subject.subjectId, // e.g., "bn", "en", "ma", etc.
          subjectName: subject.subjectName,
          caMarks: caMarks,
          aaMarks: aaMarks,
          totalMarks: totalMarks
        };
      });
  
      // Calculate overall totals
      const totalMarks = subjects.reduce((sum: number, s: any) => sum + (s.totalMarks || 0), 0);
      const avgPercentage = subjects.length > 0 ? totalMarks / subjects.length : 0;
  
      const payload = {
        studentId: parseInt(formData.studentId, 10),
        studentName: formData.studentName,
        className: formData.className || formData.studentClass,
        classRoll: parseInt(formData.classRoll, 10),
        examName: formData.examName,
        examDate: formData.examDate,
        subjects: subjects,
        totalMarks: totalMarks,
        marksPercentage: parseFloat(avgPercentage.toFixed(2)),
        remarks: formData.remarks || ""
      };
  
      // Log the payload
      console.log("Sending payload to backend:", JSON.stringify(payload, null, 2));
  
      const method = formData.id ? 'PUT' : 'POST';
      const url = formData.id 
        ? `${API_ENDPOINTS.EXAM_MARKS?.BASE || '/api/exam-marks'}/${formData.id}`
        : `${API_ENDPOINTS.EXAM_MARKS?.BASE || '/api/exam-marks'}/bulk`;
  
      console.log("Sending request to:", url, "with method:", method);
  
      const response = await api({
        url,
        method,
        data: payload,
      });

      console.log("Backend response:", response.data);
      return response.data;
      
      await fetchMarks();
      setIsFormOpen(false);
      toast.success('Exam marks saved successfully');
    } catch (error) {
      console.error('Error saving exam marks:', error);
      toast.error('Failed to save exam marks');
    }
  };
  // Edit
  const handleEdit = (mark: ExamMarks) => {
    // Create a new FormData object with only the required fields
    const formData: Partial<FormData> = {
      id: mark.id.toString(),
      studentId: mark.studentId.toString(),
      studentName: mark.studentName,
      className: mark.className,
      studentClass: mark.className,
      classRoll: mark.classRoll.toString(),
      examName: mark.examName,
      examDate: mark.examDate ? new Date(mark.examDate) : new Date(),
      subjects: [{
        sl: 1,
        subjectId: '1',
        subjectName: 'Main Subject',
        subjectMarks: mark.obtainedMarks.toString(),
        caMarks: '0',
        aaMarks: '0',
        totalMarks: mark.obtainedMarks,
        percentage: mark.marksPercentage?.toString() || '0',
        remarks: mark.remarks || ''
      }]
    };
    setEditingMark(formData);
    setIsFormOpen(true);
  };

  // View
  const navigate = useNavigate();
  const handleView = (mark: ExamMarks) => {
    navigate(`/exam-marks/${mark.id}`);
  };

  // Close
  const handleFormClose = () => {
    setEditingMark(null);
    setIsFormOpen(false);
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`${API_ENDPOINTS.EXAM_MARKS?.BASE || '/api/exam-marks'}/${id}`);
      setMarks(marks.filter((m) => m.id !== id));
      toast.success('Exam mark deleted successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete record');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Exam Results</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, class, or exam..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="w-full sm:w-auto" onClick={() => {
            setEditingMark(null);
            setIsFormOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Record
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-black">
                <thead className="text-xs uppercase bg-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Class</th>
                    <th className="px-6 py-3">Roll</th>
                    <th className="px-6 py-3">Exam</th>
                    <th className="px-6 py-3 text-right">Total</th>
                    <th className="px-6 py-3 text-right">Obtained</th>
                    <th className="px-6 py-3 text-right">%</th>
                    <th className="px-6 py-3">Grade</th>
                    <th className="px-6 py-3 text-right">Grade Point</th>
                    <th className="px-6 py-3">Remarks</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMarks.map((mark) => (
                    <tr key={mark.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-black">{mark.studentName}</div>
                        <div className="text-sm text-black">ID: {mark.studentId}</div>
                      </td>
                      <td className="px-6 py-4 text-black">{mark.className}</td>
                      <td className="px-6 py-4 text-black">{mark.classRoll}</td>
                      <td className="px-6 py-4">
                        <div className="text-black">{mark.examName}</div>
                        <div className="text-sm text-black">
                          {(() => {
                            console.log('Row data:', {
                              id: mark.id,
                              examDate: mark.examDate,
                              type: typeof mark.examDate,
                              fullMark: mark
                            });
                            return mark.examDate ? formatDate(mark.examDate) : 'N/A';
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-black">{formatNumber(mark.totalMarks || 0)}</td>
                      <td className="px-6 py-4 text-right text-black">{formatNumber(mark.obtainedMarks || 0)}</td>
                      <td className="px-6 py-4 text-right text-black">{formatNumber(mark.marksPercentage || 0)}%</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-primary/10 text-black rounded-full text-xs font-medium">
                          {mark.gradeLetter || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-black">
                        {mark.grandePoint ? mark.grandePoint.toFixed(2) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-black">
                        {mark.gradeLetter ? (
                          grades.find(g => g.gradeLetter === mark.gradeLetter)?.remarks || 'N/A'
                        ) : (
                          mark.marksPercentage !== undefined ? 
                            (grades.find(g => 
                              mark.marksPercentage >= g.rangeMin && 
                              mark.marksPercentage <= g.rangeMax
                            )?.remarks || 'N/A') : 
                            'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(mark)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              handleEdit(mark);
                              setIsFormOpen(true);
                            }}
                            title="Edit record"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to delete this record?')) {
                                try {
                                  await api.delete(`${API_ENDPOINTS.EXAM_MARKS?.BASE}/${mark.id}`);
                                  toast.success('Record deleted successfully');
                                  fetchMarks();
                                } catch (error) {
                                  console.error(error);
                                  toast.error('Failed to delete record');
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

{isFormOpen && (
        <ExamMarksForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingMark(null);
          }}
          onSave={async (data) => {
            try {
              // Get the student data to include in the request
              const studentData = marks.find(m => m.studentId === Number(data.studentId)) || {} as ExamMarks;
              
              // Transform form data to match ExamMarksRequest DTO
              const requestData = {
                studentId: data.studentId,
                studentName: studentData.studentName || data.studentName || '',
                className: studentData.className || data.className || '',
                classRoll: studentData.classRoll || data.classRoll || 0,
                examName: data.examName,
                examDate: data.examDate ? new Date(data.examDate).toISOString() : new Date().toISOString(),
                subjects: data.subjects.map(subject => ({
                  subjectId: typeof subject.subjectId === 'string' ? parseInt(subject.subjectId, 10) : subject.subjectId,
                  subjectName: String(subject.subjectName || ''),
                  subjectCode: String(subject.subjectCode || ''),
                  caMarks: typeof subject.caMarks === 'string' ? parseFloat(subject.caMarks) || 0 : (subject.caMarks || 0),
                  aaMarks: typeof subject.aaMarks === 'string' ? parseFloat(subject.aaMarks) || 0 : (subject.aaMarks || 0),
                  totalMarks: typeof subject.totalMarks === 'string' ? parseFloat(subject.totalMarks) || 0 : (subject.totalMarks || 0),
                  percentage: typeof subject.percentage === 'string' ? parseFloat(subject.percentage) || 0 : (subject.percentage || 0),
                  remarks: String(subject.remarks || '')
                }))
              };

              // Use the configured API instance which already handles authentication
              const response = await api.post(API_ENDPOINTS.EXAM_MARKS.BULK, requestData);
              
              toast.success('Exam marks saved successfully');
              fetchMarks();
              setIsFormOpen(false);
              setEditingMark(null);
              
            } catch (error: any) {
              console.error('Error saving exam marks:', error);
              
              if (error.response?.status === 401) {
                toast.error('Session expired. Please log in again.');
                // Clear any invalid tokens
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                localStorage.removeItem('user');
                sessionStorage.removeItem('user');
                // Redirect to login
                window.location.href = '/login';
              } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
              } else {
                toast.error(error.message || 'Failed to save exam marks');
              }
            }
          }}
          initialData={editingMark}
          subjectsList={subjects}
        />
      )}
    </div>
  );
};

export default ExamMarksList;
