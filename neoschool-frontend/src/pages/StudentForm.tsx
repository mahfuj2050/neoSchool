import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Clock, Check, X, Save } from "lucide-react";
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
import {
  User,
  Hash,
  Phone,
  Calendar,
  BookOpen,
  GraduationCap,
  User2,
  UserCircle2,
  Info,
  CalendarDays,
  BookOpenCheck,
  BookType,
  BookMarked,
} from "lucide-react";

const classOptions = [
  { value: "PRE_PRIMARY_4", label: "Pre Primary 4+" },
  { value: "PRE_PRIMARY_5", label: "Pre Primary 5+" },
  { value: "CLASS_ONE", label: "Class One" },
  { value: "CLASS_TWO", label: "Class Two" },
  { value: "CLASS_THREE", label: "Class Three" },
  { value: "CLASS_FOUR", label: "Class Four" },
  { value: "CLASS_FIVE", label: "Class Five" },
];

interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: any) => void;
}

const StudentForm: React.FC<StudentFormProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    studentId: `STU${new Date().getFullYear()}${String(
      Math.floor(Math.random() * 1000)
    ).padStart(3, "0")}`,
    rollNo: "",
    name: "",
    studentClass: "",
    section: "A",
    gender: "MALE",
    status: "ACTIVE",
    dob: "",
    brnNo: "",
    phone: "",
    stipend: "PENDING",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.studentClass || !formData.rollNo) {
      toast.error("Please fill in all required fields");
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[1200px] h-[80vh] max-h-[80vh] bg-white rounded-2xl shadow-xl p-0 flex flex-col mt-4 sm:mt-8">
        <div className="bg-blue-700 text-white px-6 py-4 rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <GraduationCap className="h-7 w-7 text-white" />
              <div>
                <div>Add New Student</div>
                <p className="text-sm font-normal text-blue-100 mt-1">
                  Please fill in the student's details below
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Student ID */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Student ID: {formData.studentId}</p>
                      <p className="text-xs text-blue-600 mt-1">Automatically generated</p>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <UserCircle2 className="h-5 w-5 text-blue-600" />
                    Basic Information
                  </h3>
                  
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter full name"
                        className="pl-9 h-11"
                      />
                    </div>
                  </div>

                  {/* Class */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <BookOpenCheck className="h-4 w-4 text-gray-500" />
                      Class <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.studentClass}
                      onValueChange={(value) => handleSelectChange("studentClass", value)}
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

                  {/* Section */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <BookType className="h-4 w-4 text-gray-500" />
                      Section
                    </Label>
                    <Select
                      value={formData.section}
                      onValueChange={(value) => handleSelectChange("section", value)}
                    >
                      <SelectTrigger className="h-11">
                        <BookMarked className="h-4 w-4 text-gray-400 mr-2" />
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {["A", "B", "C", "D"].map((sec) => (
                          <SelectItem key={sec} value={sec}>
                            Section {sec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <User2 className="h-4 w-4 text-gray-500" />
                      Gender
                    </Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleSelectChange("gender", value)}
                    >
                      <SelectTrigger className="h-11">
                        <UserCircle2 className="h-4 w-4 text-gray-400 mr-2" />
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    Academic Information
                  </h3>

                  {/* Roll No */}
                  <div className="space-y-2">
                    <Label htmlFor="rollNo" className="flex items-center gap-2 text-sm font-medium">
                      Roll Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="rollNo"
                        name="rollNo"
                        value={formData.rollNo}
                        onChange={handleChange}
                        placeholder="Enter roll number"
                        className="pl-9 h-11"
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <Label htmlFor="dob" className="flex items-center gap-2 text-sm font-medium">
                      <CalendarDays className="h-4 w-4 text-gray-500" />
                      Date of Birth
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="dob"
                        name="dob"
                        type="date"
                        value={formData.dob}
                        onChange={handleChange}
                        className="pl-9 h-11"
                      />
                    </div>
                  </div>

                  {/* BRN No */}
                  <div className="space-y-2">
                    <Label htmlFor="brnNo" className="flex items-center gap-2 text-sm font-medium">
                      <FileText className="h-4 w-4 text-gray-500" />
                      BRN No
                    </Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="brnNo"
                        name="brnNo"
                        value={formData.brnNo}
                        onChange={handleChange}
                        placeholder="Enter BRN number"
                        className="pl-9 h-11"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                      <Phone className="h-4 w-4 text-gray-500" />
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+880 1XXX-XXXXXX"
                        className="pl-9 h-11"
                      />
                    </div>
                  </div>

                  {/* Stipend Status */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      Stipend Status
                    </Label>
                    <Select
                      value={formData.stipend}
                      onValueChange={(value) => handleSelectChange("stipend", value)}
                    >
                      <SelectTrigger className="h-11">
                        <GraduationCap className="h-4 w-4 text-gray-400 mr-2" />
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APPROVED" className="text-green-600">
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4" /> Approved
                          </div>
                        </SelectItem>
                        <SelectItem value="PENDING" className="text-yellow-600">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Pending
                          </div>
                        </SelectItem>
                        <SelectItem value="REJECTED" className="text-red-600">
                          <div className="flex items-center gap-2">
                            <X className="h-4 w-4" /> Rejected
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t pt-4 px-6 pb-4">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-md">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-md">
              <Save className="mr-2 h-4 w-4" /> Save Student
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentForm;