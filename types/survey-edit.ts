import { Survey } from ".";

// types/survey-edit.ts
export interface Question {
  _id: string;
  customText?: string;
  customDescription?: string;
  required?: boolean;
  conditionalLogic?: {
    enabled: boolean;
    conditions: any[];
    action: 'show' | 'hide';
  };
  question?: {
    _id: string;
    text: string;
    type: string;
    options?: any[];
  };
}

export interface Section {
  _id: string;
  title: string;
  description?: string;
  order: number;
  questions: Question[];
}

export interface SurveyStructure {
  survey: Survey;
  sections: Section[];
  noSectionQuestions: Question[];
  totalSections: number;
  totalQuestions: number;
}

export interface QuestionCardProps {
  question: Question;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdateText: (text: string) => void;
  onToggleRequired: (required: boolean) => void;
  onOpenConditionalLogic: () => void;
  previewMode: boolean;
  index: number;
  isOrphaned?: boolean;
  surveyId: string;
}

export interface SectionCardProps {
  section: Section;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onUpdateTitle: (title: string) => void;
  onDelete: () => void;
  onDropQuestion: (questionId: string) => void | Promise<void>;
  onDropSection?: (draggedSectionId: string) => void | Promise<void>;
  children?: React.ReactNode;
}

export interface QuestionPropertiesPanelProps {
  questionId: string;
  surveyId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export interface ConditionalLogicModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  surveyId: string;
  allQuestions: Question[];
  onUpdate: () => void;
}

export const questionTypeIcons = {
  'text': '📝',
  'textarea': '📄',
  'select': '📋',
  'multiselect': '☑️',
  'radio': '⭕',
  'checkbox': '☑️',
  'number': '#️⃣',
  'date': '📅',
  'rating': '⭐',
  'boolean': '🔄',
} as const;

export const questionTypeLabels = {
  'text': 'Short Answer',
  'textarea': 'Long Answer',
  'select': 'Dropdown',
  'multiselect': 'Multiple Choice',
  'radio': 'Single Choice',
  'checkbox': 'Checkboxes',
  'number': 'Number',
  'date': 'Date',
  'rating': 'Rating',
  'boolean': 'Yes/No'
} as const;

export type QuestionType = keyof typeof questionTypeLabels;