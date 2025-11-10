export interface SubjectMarks {
  sl: number;
  subjectId: string;
  subjectName: string;
  subjectMarks: string | number;
  caMarks: string | number;
  aaMarks: string | number;
  totalMarks: number;
  percentage: string | number;
  remarks: string;
  [key: string]: string | number; // Index signature to allow string keys with string or number values
}

export interface FormData {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  studentClass: string;
  classRoll: string;
  examName: string;
  examDate: string | Date;
  subjects: SubjectMarks[];
  isViewMode?: boolean;
}

export interface ExamMarksFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (examMark: FormData) => void;
  initialData?: Partial<FormData>;
  subjectsList?: { 
    id: string; 
    name: string;
    marks?: number;
  }[];
}
