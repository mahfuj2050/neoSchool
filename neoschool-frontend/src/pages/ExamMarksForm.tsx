import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save, FileText, Calendar, Loader2 } from "lucide-react";
import api from "@/api/apiClient";
import { FormData, SubjectMarks, ExamMarksFormProps } from "@/types/examMarks";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { API_ENDPOINTS } from "@/config";

interface Exam {
  id: number;
  examId: string;
  examName: string;
  startDate: string;
  endDate: string;
  remarks: string | null;
}

interface ExamOption {
  value: string;
  label: string;
}

const ExamMarksForm = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  subjectsList = [],
}: ExamMarksFormProps) => {
  const [exams, setExams] = useState<ExamOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch exams from API
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await api.get(API_ENDPOINTS.EXAMS.BASE);
        const data = response.data;
        
        if (Array.isArray(data)) {
          const examOptions = data.map((exam: Exam) => ({
            value: exam.examName,
            label: exam.examName
          } as ExamOption));
          
          console.log('Loaded exam options:', examOptions);
          setExams(examOptions);
        } else {
          console.error('Unexpected exam data format:', data);
          toast.error('Unexpected response format from server');
          setExams([]);
        }
      } catch (error: any) {
        console.error('Error fetching exams:', error);
        
        if (error.response) {
          if (error.response.status === 401 || error.response.status === 403) {
            toast.error('Session expired. Please log in again.');
            window.location.href = '/login';
          } else {
            toast.error(`Error: ${error.response.data?.message || 'Failed to fetch exams'}`);
          }
        } else if (error.request) {
          console.error('No response received:', error.request);
          toast.error('No response from server. Please check your connection.');
        } else {
          console.error('Error setting up request:', error.message);
          toast.error(`Error: ${error.message}`);
        }
        
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchExams();
    }
  }, [isOpen]);

  const [formData, setFormData] = useState<FormData>({
    id: initialData?.id || "",
    studentId: initialData?.studentId || "",
    studentName: initialData?.studentName || "",
    className: initialData?.className || "",
    studentClass: initialData?.studentClass || "",
    classRoll: initialData?.classRoll || "",
    examName: initialData?.examName || "",
    examDate: initialData?.examDate ? new Date(initialData.examDate) : new Date(),
    subjects: initialData?.subjects?.length > 0 
      ? initialData.subjects 
      : subjectsList.map((s, idx) => ({
          sl: idx + 1,
          subjectId: s.id,
          subjectName: s.name,
          subjectMarks: s.marks?.toString() || "",
          caMarks: "",
          aaMarks: "",
          totalMarks: 0,
          percentage: "",
          remarks: "",
        })),
  });

  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch students when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(API_ENDPOINTS.STUDENTS.BASE);
        const data = response.data;
        
        if (Array.isArray(data)) {
          console.log("Student data loaded successfully:", data);
          setStudentsList(data);
        } else {
          console.error("Unexpected response format:", data);
          toast.error("Unexpected response format from server");
          setStudentsList([]);
        }
      } catch (error: any) {
        console.error("Error fetching students:", error);
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response data:', error.response.data);
          console.error('Error status:', error.response.status);
          console.error('Error headers:', error.response.headers);
          
          if (error.response.status === 401 || error.response.status === 403) {
            toast.error("Session expired. Please log in again.");
            // Optionally redirect to login
            window.location.href = '/login';
          } else {
            toast.error(`Error: ${error.response.data?.message || 'Failed to fetch students'}`);
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
          toast.error("No response from server. Please check your connection.");
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up request:', error.message);
          toast.error(`Error: ${error.message}`);
        }
        
        setStudentsList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [isOpen]);

  // Initialize form when modal opens or initialData changes
  useEffect(() => {
    if (!isOpen) return;

    setFormData((prev) => {
      if (initialData) {
        return {
          ...prev,
          ...initialData,
          examDate: initialData.examDate ? new Date(initialData.examDate) : new Date(),
          subjects:
            initialData.subjects?.length > 0
              ? initialData.subjects
              : subjectsList.map((s, idx) => ({
                  sl: idx + 1,
                  subjectId: s.id,
                  subjectName: s.name,
                  subjectMarks: s.marks?.toString() || "",
                  caMarks: "",
                  aaMarks: "",
                  totalMarks: 0,
                  percentage: "",
                  remarks: "",
                })),
        };
      }

      return {
        id: "",
        studentId: "",
        studentName: "",
        className: "",
        studentClass: "",
        classRoll: "",
        examName: "",
        examDate: new Date(),
        subjects: subjectsList.map((s, idx) => ({
          sl: idx + 1,
          subjectId: s.id,
          subjectName: s.name,
          subjectMarks: s.marks?.toString() || "",
          caMarks: "",
          aaMarks: "",
          totalMarks: 0,
          percentage: "",
          remarks: "",
        })),
      };
    });
  }, [isOpen, JSON.stringify(initialData), JSON.stringify(subjectsList)]);

  // Handlers
  const handleStudentChange = (selected: any) => {
    if (selected) {
      const selectedStudent = studentsList.find(s => s.studentId === selected.value);
      if (selectedStudent) {
        setFormData((prev) => ({
          ...prev,
          studentId: selectedStudent.studentId,
          studentName: selectedStudent.name,
          className: selectedStudent.studentClass || "",
          studentClass: selectedStudent.studentClass || "",
          classRoll: selectedStudent.rollNo || "",
        }));
      }
    } else {
      // Clear the student data if no student is selected
      setFormData(prev => ({
        ...prev,
        studentId: "",
        studentName: "",
        className: "",
        studentClass: "",
        classRoll: "",
      }));
    }
  };

  const handleExamChange = (selected: any) =>
    setFormData((prev) => ({ ...prev, examName: selected?.value || "" }));

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData((prev) => ({ ...prev, examDate: date }));
    }
  };

  type NumericField = 'subjectMarks' | 'caMarks' | 'aaMarks';
  type UpdatableField = NumericField | 'remarks';

  const handleSubjectChange = (
    index: number,
    field: UpdatableField,
    value: string,
    inputRef?: HTMLInputElement | null
  ) => {
    setFormData((prev) => {
      const updatedSubjects = [...prev.subjects];
      const updatedSubject = { ...updatedSubjects[index] };

      if (field === 'remarks') {
        // Handle remarks field
        updatedSubject.remarks = value;
      } else {
        // Handle numeric fields (subjectMarks, caMarks, aaMarks)
        if (value === '') {
          // For empty values, set to empty string
          updatedSubject[field as NumericField] = '';
        } else {
          // For non-empty values, parse as number
          const numericValue = parseFloat(value);
          if (!isNaN(numericValue)) {
            const maxMarks = parseFloat(String(updatedSubject.subjectMarks || "0"));

            // CA Marks validation (30% of total marks)
            if (field === "caMarks" && maxMarks > 0) {
              const maxCAMarks = maxMarks * 0.3;
              if (numericValue > maxCAMarks) {
                if (inputRef) {
                  inputRef.value = "";
                  inputRef.focus();
                }
                toast.error(`CA Marks cannot exceed 30% of total marks (max: ${maxCAMarks.toFixed(2)})`);
                return prev;
              }
            }

            // AA Marks validation (70% of total marks)
            if (field === "aaMarks" && maxMarks > 0) {
              const maxAAMarks = maxMarks * 0.7;
              if (numericValue > maxAAMarks) {
                if (inputRef) {
                  inputRef.value = "";
                  inputRef.focus();
                }
                toast.error(`AA Marks cannot exceed 70% of total marks (max: ${maxAAMarks.toFixed(2)})`);
                return prev;
              }
            }
            
            updatedSubject[field] = numericValue.toString();
          } else {
            updatedSubject[field] = value;
          }
        }
      }

      // Calculate total marks and percentage
      const ca = updatedSubject.caMarks ? parseFloat(updatedSubject.caMarks.toString()) : 0;
      const aa = updatedSubject.aaMarks ? parseFloat(updatedSubject.aaMarks.toString()) : 0;
      const maxMarks = updatedSubject.subjectMarks ? parseFloat(updatedSubject.subjectMarks.toString()) : 0;

      // Ensure CA is exactly 30% and AA is exactly 70% of maxMarks
      const normalizedCA = Math.min(ca, maxMarks * 0.3);
      const normalizedAA = Math.min(aa, maxMarks * 0.7);
      const total = normalizedCA + normalizedAA;
      const percentage = maxMarks > 0 ? ((total / maxMarks) * 100).toFixed(2) : "";

      updatedSubjects[index] = { 
        ...updatedSubject, 
        caMarks: normalizedCA.toString(),
        aaMarks: normalizedAA.toString(),
        totalMarks: total, 
        percentage 
      };

      return { ...prev, subjects: updatedSubjects };
    });
  };

  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.studentId) {
      toast.error("Student ID is required.");
      return;
    }
    if (!formData.examName) {
      toast.error("Exam name is required.");
      return;
    }

    // Transform subjects data to match backend structure
    const subjects = formData.subjects.map((subject, index) => ({
      sl: index + 1,
      subjectId: `subj_${index + 1}`,
      subjectName: subject.subjectName,
      subjectMarks: (parseFloat(String(subject.caMarks)) || 0) + (parseFloat(String(subject.aaMarks)) || 0),
      caMarks: parseFloat(String(subject.caMarks)) || 0,
      aaMarks: parseFloat(String(subject.aaMarks)) || 0,
      totalMarks: (parseFloat(String(subject.caMarks)) || 0) + (parseFloat(String(subject.aaMarks)) || 0),
      percentage: '',
      remarks: ''
    }));

    // Format the exam date to ISO string
    const formattedExamDate = formData.examDate instanceof Date 
      ? formData.examDate.toISOString()
      : new Date(formData.examDate).toISOString();

    // Prepare the final payload
    const payload: FormData = {
      id: formData.id,
      studentId: formData.studentId,
      studentName: formData.studentName,
      className: formData.className,
      studentClass: formData.studentClass,
      classRoll: formData.classRoll,
      examName: formData.examName,
      examDate: formattedExamDate,
      subjects: subjects,
      isViewMode: false
    };

    console.log('Sending payload:', JSON.stringify(payload, null, 2));
    onSave(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[80vw] max-w-[80vw] bg-white rounded-2xl shadow-xl p-0 flex flex-col">
        <div className="text-white px-6 py-4 rounded-t-2xl" style={{ backgroundColor: '#4169e1' }}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <FileText className="h-7 w-7 text-white" />
              {initialData?.id ? "Edit Exam Marks" : "Add Exam Marks"}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col h-full p-6 space-y-6 overflow-y-auto max-h-[100vh]"
        >
          {/* Student / Exam Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg border">
            {/* Student */}
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Student *</Label>
              <Select
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  option: (provided) => ({
                    ...provided,
                    color: 'black',
                    ':hover': {
                      backgroundColor: '#f0f0f0',
                      color: 'black',
                    },
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: 'black',
                  }),
                  menu: (provided) => ({
                    ...provided,
                    zIndex: 1000,
                  }),
                }}
                options={studentsList.map((s) => ({
                  value: s.studentId,
                  label: `${s.name} (${s.rollNo || 'N/A'}) - ${s.studentClass || 'N/A'}`,
                  className: s.studentClass,
                  roll: s.rollNo,
                }))}
                value={
                  studentsList.find((s) => s.studentId === formData.studentId)
                    ? {
                        value: formData.studentId,
                        label: `${formData.studentName} (${formData.classRoll || 'N/A'}) - ${formData.studentClass || 'N/A'}`,
                        className: formData.studentClass,
                        roll: formData.classRoll,
                      }
                    : null
                }
                placeholder="Select student..."
                onChange={(selected: any) => {
                  if (selected) {
                    const student = studentsList.find(s => s.studentId === selected.value);
                    if (student) {
                      setFormData((prev) => ({
                        ...prev,
                        studentId: student.studentId,
                        studentName: student.name,
                        studentClass: student.studentClass || "",
                        className: student.studentClass || "",
                        classRoll: student.rollNo || "",
                      }));
                    }
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      studentId: "",
                      studentName: "",
                      studentClass: "",
                      className: "",
                      classRoll: "",
                    }));
                  }
                }}
                isSearchable
                noOptionsMessage={() => "No students found"}
              />

            </div>

            {/* Exam Name */}
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Exam Name *</Label>
              {loading ? (
                <div className="flex items-center justify-center h-10">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <Select
                  className="w-full"
                  classNamePrefix="select"
                  styles={{
                    option: (provided) => ({
                      ...provided,
                      color: 'black',
                      ':hover': {
                        backgroundColor: '#f0f0f0',
                        color: 'black',
                      },
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: 'black',
                    }),
                    menu: (provided) => ({
                      ...provided,
                      zIndex: 1000,
                    }),
                  }}
                  options={exams}
                  value={exams.find(option => option.value === formData.examName) || null}
                  onChange={(selected) =>
                    setFormData({
                      ...formData,
                      examName: selected?.value || "",
                    })
                  }
                  placeholder="Select exam..."
                  isSearchable
                  isDisabled={loading}
                />
              )}
            </div>

            {/* Exam Date */}
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Exam Date *</Label>
              <div className="relative">
                <DatePicker
                  selected={formData.examDate instanceof Date ? formData.examDate : new Date(formData.examDate)}
                  onChange={handleDateChange}
                  className="w-full h-10 border rounded-md pl-3 pr-10 text-sm"
                  dateFormat="MMMM d, yyyy"
                />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Subjects & Marks</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">SL#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Subject ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Subject Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Marks</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">CA 30%</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">AA 70%</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">%</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.subjects.length > 0 ? (
                    formData.subjects.map((subject, index) => (
                      <tr key={subject.subjectId} className={index % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}>
                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{subject.subjectId}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{subject.subjectName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {subject.subjectMarks || 'N/A'}
                          <input
                            type="hidden"
                            name={`subjectMarks-${index}`}
                            value={subject.subjectMarks}
                            onChange={(e) => handleSubjectChange(index, "subjectMarks", e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-20 text-black"
                            value={subject.caMarks}
                            onChange={(e) => handleSubjectChange(index, "caMarks", e.target.value, e.target)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-20 text-black"
                            value={subject.aaMarks}
                            onChange={(e) => handleSubjectChange(index, "aaMarks", e.target.value, e.target)}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{subject.totalMarks.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{subject.percentage ? `${subject.percentage}%` : "0.00%"}</td>
                        <td className="px-4 py-3">
                          <Input
                            type="text"
                            className="w-32"
                            value={subject.remarks}
                            onChange={(e) => handleSubjectChange(index, "remarks", e.target.value)}
                            placeholder="Enter remarks"
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-4 py-6 text-center text-gray-500">No subjects found. Please add subjects first.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter className="border-t pt-4 flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="mr-2 h-4 w-4" /> {initialData?.id ? "Update" : "Save"} Marks
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExamMarksForm;
