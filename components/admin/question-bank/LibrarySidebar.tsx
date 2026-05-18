// components/question-bank/LibrarySidebar.tsx
import React from 'react';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

// Type for library
interface Library {
  _id: string;
  name: string;
  description?: string;
  questionsCount?: number;
}

interface LibrarySidebarProps {
  libraries: Library[];
  selectedLibraryId?: string;
  onSelectLibrary: (id: string) => void;
}

const LibrarySidebar: React.FC<LibrarySidebarProps> = ({
  libraries,
  selectedLibraryId,
  onSelectLibrary
}) => {
  return (
    <div className="w-full h-full border-r">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Libraries</h3>
          <button className="p-1 rounded-full hover:bg-gray-100">
            <span className="sr-only">Add Library</span>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2.75C8 2.33579 7.66421 2 7.25 2C6.83579 2 6.5 2.33579 6.5 2.75V6.5H2.75C2.33579 6.5 2 6.83579 2 7.25C2 7.66421 2.33579 8 2.75 8H6.5V11.75C6.5 12.1642 6.83579 12.5 7.25 12.5C7.66421 12.5 8 12.1642 8 11.75V8H11.75C12.1642 8 12.5 7.66421 12.5 7.25C12.5 6.83579 12.1642 6.5 11.75 6.5H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
      <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
        {libraries.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <p>No libraries found</p>
          </div>
        ) : (
          <ul className="space-y-0.5 p-2">
            {libraries.map((library) => (
              <li 
                key={library._id}
                className={`p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                  selectedLibraryId === library._id ? 'bg-gray-100' : ''
                }`}
                onClick={() => onSelectLibrary(library._id)}
              >
                <div className="flex items-start gap-2">
                  <BookOpen className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1"> {/* This ensures proper text truncation */}
                    <p className="font-medium text-sm mb-0.5 text-ellipsis overflow-hidden">
                      {library.name}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 break-words">
                      {library.description || "No description"}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center justify-center h-5 min-w-[1.25rem] rounded-full bg-gray-200 text-xs font-medium">
                    {library.questionsCount || 0}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LibrarySidebar;