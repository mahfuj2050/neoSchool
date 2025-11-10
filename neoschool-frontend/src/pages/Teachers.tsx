import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Eye, Edit2, Trash2, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TeacherForm from './TeacherForm';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '../config';
import { api } from '../services/authService';

interface Teacher {
  id: number;
  teacherId: string;
  fullName: string;
  section: string;
  gender: string;
  position: 'Head Teacher' | 'Teacher' | 'Assistant Teacher';
  status: 'ACTIVE' | 'INACTIVE';
  email?: string;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

const Teachers: React.FC = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Teacher; direction: 'ascending' | 'descending' } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredTeachers = useMemo(() => {
    if (!searchTerm.trim()) return teachers;
    const term = searchTerm.toLowerCase();
    return teachers.filter(t =>
      t.fullName.toLowerCase().includes(term) ||
      t.teacherId.toLowerCase().includes(term) ||
      t.email?.toLowerCase().includes(term) ||
      t.phoneNumber?.toLowerCase().includes(term)
    );
  }, [teachers, searchTerm]);

  const sortedTeachers = useMemo(() => {
    if (!sortConfig) return filteredTeachers;
    return [...filteredTeachers].sort((a, b) => {
      const aValue = String(a[sortConfig.key] || '').toLowerCase();
      const bValue = String(b[sortConfig.key] || '').toLowerCase();
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }, [filteredTeachers, sortConfig]);

  const totalPages = Math.ceil(filteredTeachers.length / rowsPerPage);
  const currentRows = useMemo(() => {
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    return sortedTeachers.slice(indexOfFirstRow, indexOfLastRow);
  }, [sortedTeachers, currentPage, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, rowsPerPage]);

  const fetchTeachers = async () => {
    try {
      setError(null);
      const response = await api.get(API_ENDPOINTS.TEACHERS.BASE);
      setTeachers(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      if (err.response?.status === 401) {
        // The interceptor should handle redirection
        return;
      }
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch teachers';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (refreshing) {
      fetchTeachers();
    }
  }, [refreshing]);

  const handleAddTeacher = async (teacherData: any) => {
    try {
      const response = await api.post(API_ENDPOINTS.TEACHERS.BASE, teacherData);
      const newTeacher = response.data;
      setTeachers(prev => [...prev, newTeacher]);
      setIsFormOpen(false);
      toast.success('Teacher added successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add teacher';
      console.error('Error adding teacher:', err);
      toast.error(errorMessage);
    }
  };

  const requestSort = (key: keyof Teacher) => {
    setSortConfig(prevConfig => {
      if (prevConfig?.key === key) {
        return { key, direction: prevConfig.direction === 'ascending' ? 'descending' : 'ascending' };
      }
      return { key, direction: 'ascending' };
    });
  };

  const getSortIndicator = (key: keyof Teacher) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTeachers();
  };

  if (loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>Loading teachers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-4 sm:px-6 py-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading teachers</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {refreshing ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Refreshing...
                    </>
                  ) : 'Try again'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Teachers</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle>Teacher List</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search teachers..."
                className="pl-8 w-full md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => requestSort('teacherId')}>Teacher ID {getSortIndicator('teacherId')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => requestSort('fullName')}>Name {getSortIndicator('fullName')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => requestSort('section')}>Section {getSortIndicator('section')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => requestSort('gender')}>Gender {getSortIndicator('gender')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => requestSort('position')}>Position {getSortIndicator('position')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => requestSort('status')}>Status {getSortIndicator('status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => requestSort('email')}>Email {getSortIndicator('email')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => requestSort('phoneNumber')}>Phone {getSortIndicator('phoneNumber')}</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRows.map(teacher => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{teacher.teacherId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{teacher.fullName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{teacher.section}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{teacher.gender}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{teacher.position}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      teacher.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>{teacher.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{teacher.email || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{teacher.phoneNumber || '-'}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-4"><Eye className="h-4 w-4" /></button>
                    <button className="text-yellow-600 hover:text-yellow-900 mr-4"><Edit2 className="h-4 w-4" /></button>
                    <button className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * rowsPerPage, filteredTeachers.length)}</span> of{' '}
                <span className="font-medium">{filteredTeachers.length}</span> teachers
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Rows per page:</span>
                <Select value={rowsPerPage.toString()} onValueChange={(value) => setRowsPerPage(Number(value))}>
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={rowsPerPage} />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 50, 100].map(size => (
                      <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
              <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
              <div className="flex items-center justify-center text-sm font-medium">Page {currentPage} of {totalPages || 1}</div>
              <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}><ChevronRight className="h-4 w-4" /></Button>
              <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0}><ChevronsRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <TeacherForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleAddTeacher}
      />
    </div>
  );
};

export default Teachers;
