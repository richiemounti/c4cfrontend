// components/setup/FileUploadTask.tsx
import { useState, useEffect } from 'react';
import { Upload, File, X, Check, Loader2, AlertCircle } from 'lucide-react';

interface FileUploadTaskProps {
  taskId: string;
  existingFile?: {
    filename: string;
    originalName?: string;
    signedUrl?: string;
    size?: number;
    mimeType?: string;
  };
  isRequired?: boolean;
  isCompleted?: boolean;
  isDisabled?: boolean;
  onFileChange: (file: File | null) => void;
}

export default function FileUploadTask({
  taskId,
  existingFile,
  isRequired = false,
  isCompleted = false,
  isDisabled = false,
  onFileChange
}: FileUploadTaskProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Clear file state when task ID changes or when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [taskId, previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Reset error state
    setError('');

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }

    // Validate file type (include shapefiles)
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
        // Shapefile formats
        'application/x-shapefile',
        'application/x-esri-shape',
        'application/octet-stream', // .shp files may have this MIME type
        'application/zip', // Zipped shapefiles
        'application/x-zip-compressed' // Alternative ZIP MIME type
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('File type not supported. Please upload an image, PDF, Word, Excel, or text document.');
      return;
    }

    // Set the file and create preview URL for images
    setFile(file);
    onFileChange(file);

    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    onFileChange(null);
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Determine if we should show existing file
  const showExistingFile = !file && existingFile?.filename;

  // Determine file extension for icon display
  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  // Determine if file is an image
  const isImageFile = (mimeType?: string): boolean => {
    return !!mimeType && mimeType.startsWith('image/');
  };

  return (
    <div className="w-full">
      {/* Show error message if any */}
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Show existing file if available */}
      {showExistingFile && (
        <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <div className="flex items-center">
            {isImageFile(existingFile.mimeType) && existingFile.signedUrl ? (
              <div className="w-12 h-12 mr-3 rounded border border-gray-300 overflow-hidden flex-shrink-0">
                <img 
                  src={existingFile.signedUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <File className="w-12 h-12 text-gray-400 mr-3 flex-shrink-0" />
            )}
            
            <div className="flex-grow">
              <p className="font-medium text-gray-900">{existingFile.originalName || 'Uploaded file'}</p>
              {existingFile.size && (
                <p className="text-xs text-gray-500">{formatFileSize(existingFile.size)}</p>
              )}
              {existingFile.signedUrl && (
                <a 
                  href={existingFile.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-600 hover:text-primary-800"
                >
                  View file
                </a>
              )}
            </div>
            
            {!isCompleted && !isDisabled && (
              <button
                type="button"
                onClick={handleRemoveFile}
                className="ml-2 p-1 rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 flex-shrink-0"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Show file preview if a new file is selected */}
      {file && (
        <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <div className="flex items-center">
            {previewUrl ? (
              <div className="w-12 h-12 mr-3 rounded border border-gray-300 overflow-hidden flex-shrink-0">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <File className="w-12 h-12 text-gray-400 mr-3 flex-shrink-0" />
            )}
            
            <div className="flex-grow">
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            </div>
            
            {!isDisabled && (
              <button
                type="button"
                onClick={handleRemoveFile}
                className="ml-2 p-1 rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 flex-shrink-0"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* File upload area - only shown if no file is selected and task is not completed */}
      {!file && !showExistingFile && !isCompleted && !isDisabled && (
        <div 
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
            isDragging 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 border-dashed'
          } rounded-md`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor={`file-upload-${taskId}`}
                className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500"
              >
                <span>Upload a file</span>
                <input
                  id={`file-upload-${taskId}`}
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={isDisabled}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
                PNG, JPG, PDF, DOC, XLS, CSV, Shapefiles, or ZIP up to 10MB
            </p>
            {isRequired && (
              <p className="text-xs text-red-500">This file is required</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}