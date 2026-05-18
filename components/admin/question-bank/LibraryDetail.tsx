// components/question-bank/LibraryDetail.tsx
import React from 'react';
import { MoreVertical } from 'lucide-react';

interface Question {
  _id: string;
  text: string;
  type: string;
  description?: string;
}

interface Library {
  _id: string;
  name: string;
  description?: string;
  questions?: Question[];
}

interface LibraryDetailProps {
  library: Library;
}

const LibraryDetail: React.FC<LibraryDetailProps> = ({ library }) => {
  const questionsCount = library.questions?.length || 0;
  
  return (
    <div className="h-full overflow-auto">
      <div className="p-4 border-b">
        <div className="flex flex-col space-y-2 mb-4">
          <h2 className="text-2xl font-semibold break-words">
            {library.name}
          </h2>
          <p className="text-muted-foreground whitespace-normal break-words">
            {library.description || "No description provided"}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {questionsCount} {questionsCount === 1 ? 'question' : 'questions'} in this library
        </p>
      </div>
      
      <div className="p-4">
        {questionsCount === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No questions in this library</p>
            <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md">
              Add Question
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {library.questions?.map((question) => (
              <div key={question._id} className="border rounded-md p-4 bg-white">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1 min-w-0"> {/* Enable proper text wrapping */}
                    <h3 className="font-medium break-words">
                      {question.text}
                    </h3>
                    {question.description && (
                      <p className="text-sm text-muted-foreground break-words whitespace-normal">
                        {question.description}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 shrink-0">
                    <button className="p-1 rounded-full hover:bg-gray-100">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <span className="px-2 py-1 bg-gray-100 text-xs rounded-md">
                    {question.type}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                    In Library
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryDetail;