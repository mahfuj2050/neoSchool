// API Configuration
export const API_BASE_URL = 'http://localhost:8080/api';

// Session Configuration
export const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes in milliseconds

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
  },
  STUDENTS: {
    BASE: `${API_BASE_URL}/students`,
  },
  SUBJECTS: {
    BASE: `${API_BASE_URL}/subjects`,
  },
  GRADES: {
    BASE: `${API_BASE_URL}/grades`,
  },
  EXAM_MARKS: {
    BASE: `${API_BASE_URL}/exam-marks`,
    BULK: `${API_BASE_URL}/exam-marks/bulk`,
  },
  TEACHERS: {
    BASE: `${API_BASE_URL}/teachers`,
  },
  EXAMS: {
    BASE: `${API_BASE_URL}/exams`,
  },
  RESULTS: {
    TABULATION: (educationYear: string, className: string, examName: string) => 
      `${API_BASE_URL}/results/tabulation-pdf/${encodeURIComponent(educationYear)}/${encodeURIComponent(examName)}/${encodeURIComponent(className)}`,
    MERIT: (educationYear: string, className: string, examName: string) => 
      `${API_BASE_URL}/results/merit-pdf/${encodeURIComponent(educationYear)}/${encodeURIComponent(examName)}/${encodeURIComponent(className)}`,
    MARKSHEET: (educationYear: string, studentId: string, examName: string) => 
      `${API_BASE_URL}/results/mark-sheet/${studentId}/${encodeURIComponent(examName)}`,
  },
};
