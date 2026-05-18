// components/project/TaskItem.tsx
import React, { useState } from 'react';
import { CheckCircle, Circle, ChevronDown, ChevronUp, FileText, Upload, X } from 'lucide-react'; // Added X
import { Task } from '@/types';

interface TaskItemProps {
  task: Task;
  onTaskComplete: (taskId: string, responseData: any, files?: File[]) => Promise<void>; // ✅ Changed
  onTaskUpdate: (taskId: string, responseData: any, files?: File[]) => Promise<void>; // ✅ Changed
  isDisabled?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onTaskComplete, 
  onTaskUpdate, 
  isDisabled = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [responseValue, setResponseValue] = useState(task.responseData || '');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // ✅ Changed to array
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleResponseChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setResponseValue(e.target.value);
  };

  // ✅ Updated to handle multiple files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Check file size
      const oversizedFiles = newFiles.filter(f => f.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setError(`Files exceed 10MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
        e.target.value = '';
        return;
      }
      
      setSelectedFiles(prev => [...prev, ...newFiles]);
      e.target.value = ''; // Reset input
    }
  };

  // ✅ Add function to remove individual files
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (markAsComplete: boolean) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      if (markAsComplete) {
        await onTaskComplete(task._id, responseValue, selectedFiles.length > 0 ? selectedFiles : undefined);
      } else {
        await onTaskUpdate(task._id, responseValue, selectedFiles.length > 0 ? selectedFiles : undefined);
      }
      
      // Reset file selection after successful upload
      setSelectedFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInputField = () => {
    switch (task.dataType) {
      case 'string':
        return (
          <input
            type="text"
            value={responseValue as string}
            onChange={handleResponseChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder={task.helperText}
            disabled={isDisabled || task.isCompleted || isSubmitting}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={responseValue as number}
            onChange={handleResponseChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder={task.helperText}
            disabled={isDisabled || task.isCompleted || isSubmitting}
          />
        );
      case 'boolean':
        return (
          <select
            value={responseValue as string}
            onChange={handleResponseChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={isDisabled || task.isCompleted || isSubmitting}
          >
            <option value="">-- Select --</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );
      case 'date':
        return (
          <input
            type="date"
            value={responseValue as string}
            onChange={handleResponseChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={isDisabled || task.isCompleted || isSubmitting}
          />
        );
      case 'array':
        if (task.options && task.options.length > 0) {
          return (
            <select
              value={responseValue as string}
              onChange={handleResponseChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={isDisabled || task.isCompleted || isSubmitting}
            >
              <option value="">-- Select --</option>
              {task.options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        return (
          <textarea
            value={responseValue as string}
            onChange={handleResponseChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter comma-separated values"
            disabled={isDisabled || task.isCompleted || isSubmitting}
          />
        );
      case 'file':
        return (
          <div className="space-y-3">
            {/* Show existing uploaded files */}
            {task.responseData?.files && Array.isArray(task.responseData.files) && task.responseData.files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Uploaded files:</p>
                {task.responseData.files.map((file: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{file.originalName}</span>
                    </div>
                    {file.fileUrl && (
                      <a 
                        href={file.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Show single file (backward compatibility) */}
            {task.responseData?.filename && !task.responseData?.files && (
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                <FileText className="h-4 w-4" />
                <a 
                  href={task.responseData.signedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {task.responseData.originalName || task.responseData.filename}
                </a>
              </div>
            )}

            {/* Show newly selected files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Selected files ({selectedFiles.length}):</p>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded-md border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-900">{file.name}</span>
                      <span className="text-xs text-blue-600">({(file.size / 1024).toFixed(2)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* File upload button */}
            <div className="flex items-center space-x-2">
              <label 
                className={`cursor-pointer px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                  isDisabled || task.isCompleted || isSubmitting 
                    ? 'bg-gray-100 text-gray-400' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Upload className="h-4 w-4 mr-2" />
                {selectedFiles.length > 0 ? 'Add More Files' : 'Choose Files'}
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isDisabled || task.isCompleted || isSubmitting}
                />
              </label>
              {selectedFiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedFiles([])}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        );
      default:
        return (
          <textarea
            value={responseValue as string}
            onChange={handleResponseChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder={task.helperText}
            rows={3}
            disabled={isDisabled || task.isCompleted || isSubmitting}
          />
        );
    }
  };

  return (
    <div className={`border rounded-md p-4 mb-4 ${task.isCompleted ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="flex items-start justify-between cursor-pointer" onClick={handleToggle}>
        <div className="flex items-start">
          <div className="mt-0.5 mr-3">
            {task.isCompleted ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-gray-300" />
            )}
          </div>
          <div>
            <h3 className="font-medium">{task.fieldLabel}</h3>
            {task.helperText && (
              <p className="text-sm text-gray-500 mt-1">{task.helperText}</p>
            )}
            {task.isRequired && (
              <span className="text-xs font-medium text-red-500 mt-1 inline-block">Required</span>
            )}
          </div>
        </div>
        <div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pl-8">
          <div className="space-y-4">
            {renderInputField()}
            
            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              {!task.isCompleted && (
                <>
                  <button
                    type="button"
                    onClick={() => handleSubmit(false)}
                    className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    disabled={isDisabled || isSubmitting}
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit(true)}
                    className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    disabled={isDisabled || isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Complete Task'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;