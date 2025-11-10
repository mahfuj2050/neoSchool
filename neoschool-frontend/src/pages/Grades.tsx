import React, { useState, useEffect } from 'react';
import { fetchGrades, deleteGrade, Grade } from '../services/gradeService';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { useToast } from '../components/ui/use-toast';
import GradeForm from '../components/grades/GradeForm';

const Grades = () => {
  console.log('Grades component rendered');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      console.log('Fetching grades...');
      const data = await fetchGrades();
      console.log('Raw grades data from API:', JSON.stringify(data, null, 2));
      
      // Ensure data is an array before setting state
      const gradesArray = Array.isArray(data) ? data : [];
      console.log('Processed grades array:', JSON.stringify(gradesArray, null, 2));
      
      // Log each grade's structure
      gradesArray.forEach((grade, index) => {
        console.log(`Grade ${index + 1} structure:`, {
          id: grade.id,
          gradeId: grade.gradeId,
          gradeLetter: grade.gradeLetter,
          gradePoint: grade.gradePoint,
          rangeMin: grade.rangeMin,
          rangeMax: grade.rangeMax,
          remarks: grade.remarks,
          hasOwnProperties: {
            id: Object.prototype.hasOwnProperty.call(grade, 'id'),
            gradeId: Object.prototype.hasOwnProperty.call(grade, 'gradeId'),
            gradeLetter: Object.prototype.hasOwnProperty.call(grade, 'gradeLetter'),
            gradePoint: Object.prototype.hasOwnProperty.call(grade, 'gradePoint'),
            rangeMin: Object.prototype.hasOwnProperty.call(grade, 'rangeMin'),
            rangeMax: Object.prototype.hasOwnProperty.call(grade, 'rangeMax'),
            remarks: Object.prototype.hasOwnProperty.call(grade, 'remarks')
          }
        });
      });
      
      setGrades(gradesArray);
    } catch (error) {
      console.error('Error loading grades:', error);
      toast({
        title: 'Error',
        description: 'Failed to load grades',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this grade?')) {
      try {
        await deleteGrade(id);
        setGrades(grades.filter(grade => grade.id !== id));
        toast({
          title: 'Success',
          description: 'Grade deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting grade:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete grade',
          variant: 'destructive',
        });
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const handleFormSuccess = () => {
    loadGrades();
  };

  const handleEdit = (grade: Grade) => {
    setSelectedGrade(grade);
    setIsFormOpen(true);
  };

  // Debug: Log the current grades state before render
  console.log('Current grades state before render:', JSON.stringify(grades, null, 2));
  console.log('Is grades an array?', Array.isArray(grades));
  console.log('Number of grades:', grades?.length || 0);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Grades Management</h1>
        <Button onClick={() => {
          setSelectedGrade(null);
          setIsFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Grade
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grades List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="border">
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="font-bold">Grade ID</TableHead>
                <TableHead className="font-bold">Grade Letter</TableHead>
                <TableHead className="font-bold">Grade Point</TableHead>
                <TableHead className="font-bold">Range</TableHead>
                <TableHead className="font-bold">Remarks</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Loading grades...
                  </TableCell>
                </TableRow>
              ) : Array.isArray(grades) && grades.length > 0 ? (
                grades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-gray-50 border-b">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.gradeId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {grade.gradeLetter || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {typeof grade.gradePoint === 'number' ? grade.gradePoint.toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {grade.rangeMin} - {grade.rangeMax}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {grade.remarks || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(grade)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Pencil className="h-4 w-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(grade.id!)}
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
                    No grades found
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <GradeForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        grade={selectedGrade}
      />
    </div>
  );
};

export default Grades;
