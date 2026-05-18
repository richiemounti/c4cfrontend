// components/survey/SurveySidebar.tsx
'use client';

import { 
  Plus, 
  Layout, 
  Sparkles,
  Type,
  FileText,
  List,
  CheckSquare,
  Circle,
  Hash,
  Calendar,
  Star,
  ToggleLeft
} from 'lucide-react';
import { Button } from "@/components/ui/button";

interface SurveySidebarProps {
  onCreateSection: () => void;
  onAddQuestion: (type: string) => void;
}

// Question type configurations
const questionTypes = [
  { type: 'text', label: 'Short Answer', icon: Type, description: 'Single line text input' },
  { type: 'textarea', label: 'Long Answer', icon: FileText, description: 'Multi-line text input' },
  { type: 'select', label: 'Dropdown', icon: List, description: 'Select one from dropdown' },
  { type: 'radio', label: 'Multiple Choice', icon: Circle, description: 'Select one option' },
  { type: 'checkbox', label: 'Checkboxes', icon: CheckSquare, description: 'Select multiple options' },
  { type: 'number', label: 'Number', icon: Hash, description: 'Numeric input' },
  { type: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
  { type: 'rating', label: 'Rating', icon: Star, description: 'Star rating' },
  { type: 'boolean', label: 'Yes/No', icon: ToggleLeft, description: 'Yes or No choice' },
];

export const SurveySidebar = ({ onCreateSection, onAddQuestion }: SurveySidebarProps) => {
  return (
    <div className="w-72 bg-white/95 backdrop-blur-sm border-r border-concrete-500/20 p-6 h-screen sticky top-16 overflow-y-auto">
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-stratosphere-900 mb-4 flex items-center gap-2">
            <Layout className="h-5 w-5 text-coral-500" />
            Structure
          </h3>
          <Button 
            onClick={onCreateSection}
            className="w-full bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white shadow-md mb-4 transition-all hover:shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-sky-500 mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Question Types
          </h4>
          <div className="space-y-2">
            {questionTypes.map(({ type, label, icon: Icon, description }) => (
              <Button
                key={type}
                variant="ghost"
                className="w-full justify-start h-auto p-4 hover:bg-gradient-to-r hover:from-sky-50 hover:to-stratosphere-50 border border-transparent hover:border-sky-500/20 rounded-xl transition-all group"
                onClick={() => onAddQuestion(type)}
              >
                <div className="p-2 bg-gradient-to-br from-sky-50 to-stratosphere-50 rounded-lg mr-3 group-hover:from-sky-100 group-hover:to-stratosphere-100 transition-all">
                  <Icon className="h-4 w-4 text-sky-500" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-stratosphere-900">{label}</div>
                  <div className="text-xs text-sky-500">{description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};