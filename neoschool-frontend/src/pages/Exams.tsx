import React, { useState, useEffect } from 'react';
import { fetchExams, Exam } from '@/services/examService';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHeader } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

export default function Exams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    setLoading(true);
    try {
      console.log('Fetching exams...');
      const response = await fetchExams();
      console.log('Raw exams data from API:', response);
      
      // Ensure we have an array of exams
      const examsData = Array.isArray(response) ? response : [];
      console.log('Processed exams array:', examsData);
      
      // Transform the data to match the expected format
      const formattedExams = examsData.map(exam => ({
        id: exam.id,
        examId: exam.examId,
        examName: exam.examName,
        startDate: exam.startDate,
        endDate: exam.endDate,
        remarks: exam.remarks || null
      }));
      
      console.log('Formatted exams:', formattedExams);
      setExams(formattedExams);
    } catch (error) {
      console.error('Error loading exams:', error);
      toast({
        title: 'Error',
        description: 'Failed to load exams',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString; // Return as is if date parsing fails
    }
  };

  // Log the current exams state for debugging
  useEffect(() => {
    console.log('Current exams state:', exams);
    console.log('Number of exams:', exams.length);
  }, [exams]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Exams Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Exam
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exams List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="border">
            <TableHeader className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Exam ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Exam Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Remarks</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Actions</th>
              </tr>
            </TableHeader>
            <TableBody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading exams...
                  </td>
                </tr>
              ) : Array.isArray(exams) && exams.length > 0 ? (
                exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50 border-b">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exam.examId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {exam.examName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exam.startDate ? formatDate(exam.startDate) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exam.endDate ? formatDate(exam.endDate) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exam.remarks || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {}}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Pencil className="h-4 w-4 inline" />
                      </button>
                      <button
                        onClick={() => {}}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No exams found
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
