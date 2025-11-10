import React, { useState, useEffect } from 'react';
import { createGrade, updateGrade, Grade } from '../../services/gradeService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { useToast } from '../ui/use-toast';

interface GradeFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  grade?: Grade | null;
}

const GradeForm: React.FC<GradeFormProps> = ({ open, onClose, onSuccess, grade }) => {
  const [formData, setFormData] = useState<Omit<Grade, 'id'>>({
    gradeId: '',
    gradeLetter: '',
    gradePoint: 0,
    rangeMin: 0,
    rangeMax: 0,
    remarks: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (grade) {
      setFormData({
        gradeId: grade.gradeId,
        gradeLetter: grade.gradeLetter,
        gradePoint: grade.gradePoint,
        rangeMin: grade.rangeMin,
        rangeMax: grade.rangeMax,
        remarks: grade.remarks || '',
      });
    } else {
      setFormData({
        gradeId: '',
        gradeLetter: '',
        gradePoint: 0,
        rangeMin: 0,
        rangeMax: 0,
        remarks: '',
      });
    }
  }, [grade]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Point') || name.includes('Min') || name.includes('Max') 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (grade && grade.id) {
        await updateGrade(grade.id, formData);
        toast({
          title: 'Success',
          description: 'Grade updated successfully',
        });
      } else {
        await createGrade(formData);
        toast({
          title: 'Success',
          description: 'Grade created successfully',
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving grade:', error);
      toast({
        title: 'Error',
        description: 'Failed to save grade',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{grade ? 'Edit Grade' : 'Add New Grade'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gradeId">Grade ID</Label>
              <Input
                id="gradeId"
                name="gradeId"
                value={formData.gradeId}
                onChange={handleChange}
                required
                maxLength={20}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gradeLetter">Grade Letter</Label>
              <Input
                id="gradeLetter"
                name="gradeLetter"
                value={formData.gradeLetter}
                onChange={handleChange}
                required
                maxLength={5}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gradePoint">Grade Point</Label>
              <Input
                id="gradePoint"
                name="gradePoint"
                type="number"
                step="0.01"
                min="0"
                max="5"
                value={formData.gradePoint}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rangeMin">Min Range</Label>
              <Input
                id="rangeMin"
                name="rangeMin"
                type="number"
                min="0"
                max="100"
                value={formData.rangeMin}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rangeMax">Max Range</Label>
              <Input
                id="rangeMax"
                name="rangeMax"
                type="number"
                min="0"
                max="100"
                value={formData.rangeMax}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Input
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              maxLength={255}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Grade'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GradeForm;
