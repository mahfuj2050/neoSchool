import React from 'react';
import { Card } from '@/components/ui/card';
import { FileText, BookOpen, Trophy, Users } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

const CategoryCards: React.FC = () => {
  const categories = [
    {
      title: 'Exam',
      icon: FileText,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Subject',
      icon: BookOpen,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      title: 'Result',
      icon: Trophy,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200'
    },
    {
      title: 'Class',
      icon: Users,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {categories.map((category, index) => {
        const IconComponent = category.icon;
        return (
          <Card 
            key={index}
            className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${category.bgColor} ${category.borderColor} border`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-white">
                  <IconComponent className={`h-5 w-5 ${category.iconColor}`} />
                </div>
                <span className="font-medium text-gray-700">{category.title}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default CategoryCards;