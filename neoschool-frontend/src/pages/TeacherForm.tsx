import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save, User, Info } from "lucide-react";
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

interface TeacherFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacher: any) => void;
  teacher?: any;
  initialData?: any;
}

const sectionOptions = ["A", "B", "C", "D"];
const genderOptions = ["Male", "Female", "Other"];
const positionOptions = ["Head Teacher", "Teacher", "Assistant Teacher"];
const statusOptions = ["ACTIVE", "INACTIVE"];

const TeacherForm: React.FC<TeacherFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    teacherId: "",
    fullName: "",
    section: "",
    gender: "",
    position: "",
    status: "ACTIVE",
    email: "",
    phoneNumber: "",
  });

  // Function to fetch the latest teacher ID and generate the next one
  const generateTeacherId = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/teachers/latest');
      if (response.ok) {
        const data = await response.json();
        if (data.teacherId) {
          // Extract the numeric part, increment by 1, and format back to 5 digits
          const lastNumber = parseInt(data.teacherId.split('-')[1]);
          const nextNumber = lastNumber + 1;
          return `TCHR-${nextNumber.toString().padStart(5, '0')}`;
        }
      }
      // Start from 7 since TCHR-00001 to TCHR-00006 already exist
      return 'TCHR-00007';
    } catch (error) {
      console.error('Error generating teacher ID:', error);
      return 'TCHR-00001';
    }
  }, []);

  useEffect(() => {
    const setInitialFormData = async () => {
      if (initialData) {
        setFormData({
          teacherId: initialData.teacherId || "",
          fullName: initialData.fullName || "",
          section: initialData.section || "",
          gender: initialData.gender || "",
          position: initialData.position || "",
          status: initialData.status || "ACTIVE",
          email: initialData.email || "",
          phoneNumber: initialData.phoneNumber || "",
        });
      } else {
        // Only generate new ID when creating a new teacher
        const newTeacherId = await generateTeacherId();
        setFormData(prev => ({
          ...prev,
          teacherId: newTeacherId
        }));
      }
    };

    setInitialFormData();
  }, [initialData, generateTeacherId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teacherId || !formData.fullName || !formData.position) {
      toast.error("Please fill in all required fields");
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[600px] bg-white rounded-2xl shadow-xl p-0 flex flex-col">
        <div className="bg-blue-700 text-white px-6 py-4 rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <User className="h-7 w-7 text-white" />
              <div>
                {initialData?.teacherId ? "Edit" : "Add New"} Teacher
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Teacher ID */}
            <div className="space-y-2">
              <Label htmlFor="teacherId" className="flex items-center gap-2 text-sm font-medium">
                <Info className="h-4 w-4 text-blue-600" />
                Teacher ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="teacherId"
                name="teacherId"
                value={formData.teacherId}
                onChange={handleChange}
                placeholder="Teacher ID will be auto-generated"
                className="h-11 bg-gray-100"
                readOnly
                required
              />
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4 text-blue-600" />
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                className="h-11"
                required
              />
            </div>

            {/* Section */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">Section</Label>
              <Select
                value={formData.section}
                onValueChange={(value) => handleSelectChange("section", value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sectionOptions.map((section) => (
                    <SelectItem key={section} value={section}>{section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((gender) => (
                    <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">Position <span className="text-red-500">*</span></Label>
              <Select
                value={formData.position}
                onValueChange={(value) => handleSelectChange("position", value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map((pos) => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="h-11"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium">Phone</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="h-11"
              />
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-md">
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-md">
              <Save className="mr-2 h-4 w-4" /> {initialData?.teacherId ? "Update" : "Save"} Teacher
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherForm;
