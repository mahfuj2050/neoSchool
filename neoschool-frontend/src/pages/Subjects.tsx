import React, { useState, useEffect, useCallback } from 'react';
import SubjectForm from './SubjectForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '../config';
import { api } from '../services/authService';

interface Subject {
  id: number;
  name: string;
  code: string;
  classLevel: string;
  marks: number;
  teacher: string;
  status: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Fetch subjects from API
  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      console.log('1. Starting to fetch subjects from:', API_ENDPOINTS.SUBJECTS?.BASE);
      const response = await api.get(API_ENDPOINTS.SUBJECTS?.BASE);
      
      console.log('2. Raw API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        hasData: !!response.data,
        dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
        dataLength: Array.isArray(response.data) ? response.data.length : 'N/A'
      });
      
      if (!response.data) {
        console.error('3. No data in response');
        throw new Error('No data received from server');
      }
      
      const subjectsData = Array.isArray(response.data) ? response.data : [];
      console.log('4. Processed subjects data:', {
        count: subjectsData.length,
        firstItemKeys: subjectsData[0] ? Object.keys(subjectsData[0]) : 'no items',
        allItemsHaveCode: subjectsData.every(s => 'code' in s),
        allItemsHaveClassLevel: subjectsData.every(s => 'classLevel' in s)
      });
      
      // Log first 3 items for inspection
      console.log('5. First 3 items:', subjectsData.slice(0, 3).map(item => ({
        id: item.id,
        name: item.name,
        code: item.code,
        classLevel: item.classLevel,
        hasCode: 'code' in item,
        hasClassLevel: 'classLevel' in item
      })));
      
      if (subjectsData.length === 0) {
        toast.info('No subjects found');
      }
      
      setSubjects(subjectsData);
    } catch (err: any) {
      console.error('Error fetching subjects:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load subjects. Please try again later.';
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      toast.error(errorMessage);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Filter subjects based on search term
  const filteredSubjects = React.useMemo(() => {
    console.log('Filtering subjects:', {
      totalSubjects: subjects.length,
      searchTerm,
      firstSubject: subjects[0] ? {
        name: subjects[0].name,
        code: subjects[0].code,
        classLevel: subjects[0].classLevel,
        teacher: subjects[0].teacher
      } : 'no subjects'
    });
    
    return subjects.filter(subject => {
      const matches = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (subject.code && subject.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (subject.classLevel && subject.classLevel.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (subject.teacher && subject.teacher.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (matches) {
        console.log('Match found:', {
          name: subject.name,
          code: subject.code,
          classLevel: subject.classLevel,
          matchesTerm: searchTerm
        });
      }
      
      return matches;
    });
  }, [subjects, searchTerm]);

  // Handle subject save
  const handleSave = async (subjectData: any) => {
    try {
      if (subjectData.id) {
        // Update existing subject
        await api.put(`${API_ENDPOINTS.SUBJECTS?.BASE || '/api/subjects'}/${subjectData.id}`, subjectData);
      } else {
        // Create new subject
        await api.post(API_ENDPOINTS.SUBJECTS?.BASE || '/api/subjects', subjectData);
      }
      
      await fetchSubjects();
      setIsFormOpen(false);
      toast.success(`Subject ${subjectData.id ? 'updated' : 'added'} successfully`);
    } catch (err: any) {
      console.error('Error saving subject:', err);
      const errorMessage = err.response?.data?.message || `Failed to ${subjectData.id ? 'update' : 'add'} subject`;
      toast.error(errorMessage);
    }
  };

  // Handle edit button click
  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsFormOpen(true);
  };

  // Handle form close
  const handleFormClose = () => {
    setEditingSubject(null);
    setIsFormOpen(false);
  };

  // Handle subject deletion
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      await api.delete(`${API_ENDPOINTS.SUBJECTS?.BASE || '/api/subjects'}/${id}`);
      await fetchSubjects();
      toast.success('Subject deleted successfully');
    } catch (err: any) {
      console.error('Error deleting subject:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete subject';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-muted-foreground">Loading subjects...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>
          <p className="text-sm text-muted-foreground">
            {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'} found
          </p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, code, class..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => {
            setEditingSubject(null);
            setIsFormOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add Subject
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm table-fixed">
                <thead className="[&_tr]:border-b">
                  <tr className="bg-blue-600 text-white h-12">
                    <th className="w-16 px-3 text-left align-middle font-medium">ID</th>
                    <th className="min-w-[200px] px-4 text-left align-middle font-medium">Name</th>
                    <th className="w-28 px-2 text-center align-middle font-medium">Code</th>
                    <th className="w-32 px-2 text-center align-middle font-medium">Class</th>
                    <th className="w-24 px-2 text-center align-middle font-medium">Marks</th>
                    <th className="min-w-[200px] px-4 text-left align-middle font-medium">Teacher</th>
                    <th className="w-28 px-2 text-center align-middle font-medium">Status</th>
                    <th className="w-28 px-2 text-right align-middle font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredSubjects.length > 0 ? (
                    filteredSubjects.map((subject) => {
                      console.log('Rendering subject row:', {
                        id: subject.id,
                        code: subject.code,
                        classLevel: subject.classLevel,
                        hasCode: 'code' in subject,
                        hasClassLevel: 'classLevel' in subject
                      });
                      return (
                      <tr key={subject.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-2 align-middle">
                          <div className="font-mono text-sm text-center text-black">{subject.id}</div>
                        </td>
                        <td className="p-2 align-middle">
                          <div className="font-medium text-black">{subject.name || '-'}</div>
                          {subject.description && (
                            <div className="text-xs text-muted-foreground">{subject.description}</div>
                          )}
                        </td>
                        <td className="p-2 align-middle">
                          <div className="flex flex-col items-center">
                            <div className="font-mono px-2 py-1 rounded text-center w-full text-black">
                              {subject.code || 'NO_CODE'}
                            </div>
                            {!subject.code && (
                              <div className="text-xs text-red-500 text-center">
                                Code is missing
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-2 align-middle">
                          <div className="flex flex-col items-center">
                            <div className="px-2 py-1 rounded-md text-sm text-center w-full text-black">
                              {subject.classLevel ? subject.classLevel.replace(/_/g, ' ') : 'NO_CLASS_LEVEL'}
                            </div>
                            {!subject.classLevel && (
                              <div className="text-xs text-red-500 text-center">
                                Class level missing
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex justify-center">
                            <span className="px-2 py-1 bg-blue-50 text-black rounded-md font-medium">
                              {subject.marks || '0'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                            <div className="truncate text-black">
                              {subject.teacher
                                ? subject.teacher
                                    .split('_')
                                    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
                                    .join(' ')
                                : '-'}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            subject.status === 'MAIN' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {subject.status === 'MAIN' ? 'Main' : 'Optional'}
                          </span>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                              onClick={() => handleEdit(subject)}
                              title="Edit subject"
                            >
                              <Edit2 className="h-4 w-4 text-blue-600" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-50"
                              onClick={() => handleDelete(subject.id)}
                              title="Delete subject"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )})
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Search className="h-12 w-12 text-gray-300" />
                          <p className="text-lg font-medium">No subjects found</p>
                          <p className="text-sm">Try adjusting your search or add a new subject</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Subject Form Modal */}
      <SubjectForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleSave}
        initialData={editingSubject}
      />
    </div>
  );
};

export default Subjects;
