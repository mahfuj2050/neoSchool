import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Edit2, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type Student = {
  id: number;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  contact: string;
  attendance: string;
  status: 'Active' | 'Inactive' | 'Suspended';
};

// Header component with filter input
const HeaderWithFilter = ({ column, title }: { column: any, title: string }) => {
  return (
    <div className="flex flex-col space-y-1">
      <div className="font-medium text-gray-600 text-sm">{title}</div>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Filter..."
          className="pl-8 h-8 text-sm"
          value={(column.getFilterValue() as string) ?? ''}
          onChange={(e) => column.setFilterValue(e.target.value)}
        />
      </div>
    </div>
  );
};

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <HeaderWithFilter column={column} title="Student Name" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">
              {row.original.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <span className="font-medium">{row.getValue('name')}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'rollNumber',
    header: ({ column }) => <div className="text-gray-600 text-sm">Roll No.</div>,
    cell: ({ row }) => <div className="text-sm">{row.getValue('rollNumber')}</div>,
  },
  {
    accessorKey: 'class',
    header: ({ column }) => <div className="text-gray-600 text-sm">Class</div>,
    cell: ({ row }) => <div className="text-sm">{row.getValue('class')}</div>,
  },
  {
    accessorKey: 'section',
    header: ({ column }) => <div className="text-gray-600 text-sm">Section</div>,
    cell: ({ row }) => <div className="text-sm">{row.getValue('section')}</div>,
  },
  {
    accessorKey: 'contact',
    header: ({ column }) => <div className="text-gray-600 text-sm">Contact</div>,
    cell: ({ row }) => <div className="text-sm">{row.getValue('contact')}</div>,
  },
  {
    accessorKey: 'attendance',
    header: ({ column }) => <div className="text-gray-600 text-sm">Attendance</div>,
    cell: ({ row }) => (
      <div className="flex items-center">
        <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${parseInt(row.getValue('attendance'))}%` }}
          />
        </div>
        <span className="text-sm">{row.getValue('attendance')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <div className="text-gray-600 text-sm">Status</div>,
    cell: ({ row }) => {
      const status = row.getValue('status');
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          status === 'Active' ? 'bg-green-100 text-green-800' :
          status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status as string}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Eye className="h-4 w-4 text-gray-500" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit2 className="h-4 w-4 text-blue-500" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    ),
  },
];
