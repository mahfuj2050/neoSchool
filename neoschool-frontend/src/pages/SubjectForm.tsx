import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save, BookOpen, Hash, User, Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface SubjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: any) => void;
  subject?: any;
  initialData?: any;
}

const classOptions = [
  { value: "PRE_PRIMARY_4", label: "Pre Primary 4+" },
  { value: "PRE_PRIMARY_5", label: "Pre Primary 5+" },
  { value: "CLASS_ONE", label: "Class One" },
  { value: "CLASS_TWO", label: "Class Two" },
  { value: "CLASS_THREE", label: "Class Three" },
  { value: "CLASS_FOUR", label: "Class Four" },
  { value: "CLASS_FIVE", label: "Class Five" },
];

const SubjectForm: React.FC<SubjectFormProps> = ({
  isOpen,
  onClose,
  onSave,
  subject: propSubject,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    code: '',
    class: '',
    marks: '',
    teacher: '',
    status: 'Active',
    description: '',
  });

  // Initialize form with initialData when it changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || '',
        name: initialData.name || '',
        code: initialData.code || '',
        class: initialData.class || '',
        marks: initialData.marks || '',
        teacher: initialData.teacher || '',
        status: initialData.status || 'Active',
        description: initialData.description || '',
      });
    } else {
      // Reset form when there's no initialData
      setFormData({
        id: '',
        name: '',
        code: '',
        class: '',
        marks: '',
        teacher: '',
        status: 'Active',
        description: '',
      });
    }
  }, [initialData]);

  // Remove the duplicate useEffect for propSubject since we're using initialData
  // The initialData effect will handle both cases

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Helper function to get the class label from value
  const getClassLabel = (value: string) => {
    const found = classOptions.find(option => option.value === value);
    return found ? found.label : value;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.class || !formData.marks) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Only include id if we're updating an existing subject
    const submitData = { ...formData };
    if (!initialData?.id) {
      delete submitData.id;
    }
    
    onSave(submitData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[600px] bg-white rounded-2xl shadow-xl p-0 flex flex-col">
        <div className="bg-blue-700 text-white px-6 py-4 rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <BookOpen className="h-7 w-7 text-white" />
              <div>
                <DialogTitle>{initialData?.id ? 'Edit' : 'Add New'} Subject</DialogTitle>
                <p className="text-sm font-normal text-blue-100 mt-1">
                  Please fill in the subject details below
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                <Info className="h-4 w-4 text-blue-600" />
                Subject Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter subject name"
                  className="pl-9 h-11"
                  required
                />
              </div>
            </div>

            {/* Subject Code */}
            <div className="space-y-2">
              <Label htmlFor="code" className="flex items-center gap-2 text-sm font-medium">
                <Hash className="h-4 w-4 text-blue-600" />
                Subject Code <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g., MATH-101"
                  className="pl-9 h-11"
                  required
                />
              </div>
            </div>

            {/* Class */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="h-4 w-4 text-blue-600" />
                Class <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.class}
                onValueChange={(value) => handleSelectChange("class", value)}
              >
                <SelectTrigger className="h-11">
                  <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Teacher */}
            <div className="space-y-2">
              <Label htmlFor="teacher" className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4 text-blue-600" />
                Teacher
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="teacher"
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleChange}
                  placeholder="Teacher's name"
                  className="pl-9 h-11"
                />
              </div>
            </div>

            {/* Marks */}
            <div className="space-y-2">
              <Label htmlFor="marks" className="flex items-center gap-2 text-sm font-medium">
                <Hash className="h-4 w-4 text-blue-600" />
                Marks <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="marks"
                  name="marks"
                  type="number"
                  value={formData.marks}
                  onChange={handleChange}
                  placeholder="Enter total marks"
                  className="pl-9 h-11"
                  required
                  min="0"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Info className="h-4 w-4 text-blue-600" />
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger className="h-11">
                  <Info className="h-4 w-4 text-gray-400 mr-2" />
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter subject description"
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter className="border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-md">
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-md">
              <Save className="mr-2 h-4 w-4" /> {propSubject ? 'Update' : 'Save'} Subject
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubjectForm;
