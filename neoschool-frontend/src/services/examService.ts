import { api } from './authService';

const API_URL = '/exams';

export interface Exam {
  id?: number;
  examId: string;
  examName: string;
  startDate: string;
  endDate: string;
  remarks?: string | null;
}

export const fetchExams = async (): Promise<Exam[]> => {
  const response = await api.get(API_URL);
  return response.data;
};

export const createExam = async (exam: Omit<Exam, 'id'>): Promise<Exam> => {
  const response = await api.post(API_URL, exam);
  return response.data;
};

export const updateExam = async (id: number, exam: Partial<Exam>): Promise<Exam> => {
  const response = await api.put(`${API_URL}/${id}`, exam);
  return response.data;
};

export const deleteExam = async (id: number): Promise<void> => {
  await api.delete(`${API_URL}/${id}`);
};
