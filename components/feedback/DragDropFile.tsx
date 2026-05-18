// components/feedback/DragDropFile.tsx

'use client'
import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface DragDropFileProps {
  onFileSelected: (file: File) => void;
  onFileClear: () => void;
  previewUrl: string | null;
  accept?: string;
  maxSize?: number; // in bytes
}

const DragDropFile: React.FC<DragDropFileProps> = ({
  onFileSelected,
  onFileClear,
  previewUrl,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024 // 5MB default
}) => {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize) {
      setError(`File is too large. Maximum size is ${maxSize / 1024 / 1024}MB.`);
      return false;
    }

    // Check file type if accept is specified
    if (accept && accept !== '*') {
      // For image/* type checks
      if (accept.includes('/*')) {
        const generalType = accept.split('/')[0];
        if (!file.type.startsWith(`${generalType}/`)) {
          setError(`Only ${generalType} files are accepted.`);
          return false;
        }
      } 
      // For specific extensions
      else if (!accept.split(',').some(type => file.type === type.trim())) {
        setError(`Invalid file type. Accepted types: ${accept}`);
        return false;
      }
    }

    setError(null);
    return true;
  };

  const processFile = (file: File) => {
    if (validateFile(file)) {
      onFileSelected(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-2 text-sm text-red-600">{error}</div>
      )}

      {!previewUrl ? (
        <div
          className={`mt-1 flex justify-center rounded-md border-2 border-dashed p-6 ${
            dragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label className="relative cursor-pointer font-medium text-primary-600 hover:text-primary-500">
                <span>Upload a file</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="sr-only"
                  accept={accept}
                  onChange={handleFileChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              {accept === 'image/*' 
                ? 'PNG, JPG, GIF'
                : accept.replace(/,/g, ', ').replace(/\*/g, 'any')}
              {" up to "}{(maxSize / 1024 / 1024).toFixed(0)}MB
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <img
            src={previewUrl}
            alt="File preview"
            className="h-auto w-full max-h-48 object-contain rounded border border-gray-300"
          />
          <button
            type="button"
            onClick={onFileClear}
            className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DragDropFile;