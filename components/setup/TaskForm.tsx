// components/setup/TaskForm.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Upload, 
  File, 
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { 
  completeProjectSetupTask,
  updateProjectSetupTaskData 
} from '@/lib/api/projectSetup';
import { 
  completeProjectSiteSetupTask,
  updateProjectSiteSetupTaskData 
} from '@/lib/api/projectSiteSetup';
import { Task } from '@/types';

interface TaskFormProps {
  setupId: string;
  tasks: Task[];
  currentTaskIndex: number;
  parentType: 'project' | 'site';
  parentId: string;
  onTaskComplete?: () => void;
  onSave?: () => void;
  onNavigate?: (index: number) => void;
}

export default function TaskForm({
  setupId,
  tasks,
  currentTaskIndex,
  parentType,
  parentId,
  onTaskComplete,
  onSave,
  onNavigate
}: TaskFormProps) {
  const router = useRouter();
  const currentTask = tasks[currentTaskIndex];
  
  const [formData, setFormData] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Initialize form data when the current task changes
    if (currentTask) {
      setFile(null);

      if (currentTask.responseData !== null && currentTask.responseData !== undefined) {
        setFormData(currentTask.responseData);
      } else {
        switch (currentTask.dataType) {
          case 'string':
            setFormData('');
            break;
          case 'number':
            setFormData(0);
            break;
          case 'boolean':
            setFormData(false);
            break;
          case 'array':
            setFormData([]);
            break;
          case 'file':
            setFormData(null);
            break;
          default:
            setFormData(null);
        }
      }
    }
  }, [currentTask._id]);

  const handleStringChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(e.target.value);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(parseFloat(e.target.value) || 0);
  };

  const handleBooleanChange = (value: boolean) => {
    setFormData(value);
  };

  const handleArrayChange = (option: string) => {
    const currentArray = Array.isArray(formData) ? formData : [];
    if (currentArray.includes(option)) {
      setFormData(currentArray.filter((item: string) => item !== option));
    } else {
      setFormData([...currentArray, option]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const validateFormData = () => {
    if (!currentTask.isRequired) return true;

    switch (currentTask.dataType) {
      case 'string':
        return formData && formData.trim() !== '';
      case 'number':
        return formData !== null && formData !== undefined && !isNaN(formData);
      case 'boolean':
        return formData !== null && formData !== undefined;
      case 'array':
        return Array.isArray(formData) && formData.length > 0;
      case 'file':
        return file || (currentTask.responseData && currentTask.responseData.filename);
      default:
        return true;
    }
  };

  const handleSave = async (files?: File[]) => {
    
    if (!validateFormData()) {
      setError('This field is required');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (parentType === 'project') {
        await updateProjectSetupTaskData(setupId, currentTask._id, formData, files);
      } else {
        await updateProjectSiteSetupTaskData(setupId, currentTask._id, formData, files);
      }

      setSuccess('Progress saved successfully');
      
      if (onSave) {
        onSave();
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save progress');
      console.error('Error saving task progress:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (files?: File[]) => {
    
    if (!validateFormData()) {
      setError('This field is required to complete the task');
      return;
    }

    try {
      setCompleting(true);
      setError('');

      if (parentType === 'project') {
        await completeProjectSetupTask(setupId, currentTask._id, formData, files);
      } else {
        await completeProjectSiteSetupTask(setupId, currentTask._id, formData, files);
      }

      setSuccess('Task completed successfully');
      
      if (onTaskComplete) {
        onTaskComplete();
      }

      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      setError('Failed to complete task');
      console.error('Error completing task:', err);
    } finally {
      setCompleting(false);
    }
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentTaskIndex > 0 && onNavigate) {
      onNavigate(currentTaskIndex - 1);
    } else if (direction === 'next' && currentTaskIndex < tasks.length - 1 && onNavigate) {
      onNavigate(currentTaskIndex + 1);
    }
  };

  if (!currentTask) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <span className="ml-2">Loading task...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Task navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => handleNavigate('prev')}
          disabled={currentTaskIndex === 0}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </button>
        <div className="text-sm text-gray-600">
          Task {currentTaskIndex + 1} of {tasks.length}
        </div>
        <button 
          onClick={() => handleNavigate('next')}
          disabled={currentTaskIndex === tasks.length - 1}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>

      {/* Task header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{currentTask.fieldLabel}</h2>
          {currentTask.isCompleted && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <Check className="h-4 w-4 mr-1" />
              Completed
            </span>
          )}
        </div>
        <p className="text-gray-600 mt-1">{currentTask.helperText}</p>
        {currentTask.hoverText && (
          <p className="text-sm text-gray-500 mt-1 italic">{currentTask.hoverText}</p>
        )}
      </div>

      {/* Error and success messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
          <Check className="h-4 w-4 mr-2 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Task form based on data type */}
      <div className="mb-8">
        {currentTask.dataType === 'string' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your response
              {currentTask.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={formData || ''}
              onChange={handleStringChange}
              rows={5}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Type your response here..."
            />
          </div>
        )}

        {currentTask.dataType === 'number' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter a number
              {currentTask.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={formData || 0}
              onChange={handleNumberChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        )}

        {currentTask.dataType === 'boolean' && (
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">
              Select an option
              {currentTask.isRequired && <span className="text-red-500 ml-1">*</span>}
            </p>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleBooleanChange(true)}
                className={`px-4 py-2 rounded-md ${
                  formData === true
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleBooleanChange(false)}
                className={`px-4 py-2 rounded-md ${
                  formData === false
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                No
              </button>
            </div>
          </div>
        )}

        {currentTask.dataType === 'array' && currentTask.options && currentTask.options.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select all that apply
              {currentTask.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {/* Selected items display */}
            {Array.isArray(formData) && formData.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {formData.map((item: string) => (
                  <span
                    key={item}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleArrayChange(item)}
                      className="ml-2 hover:text-primary-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Checkbox options */}
            <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
              {currentTask.options.map((option) => {
                const isSelected = Array.isArray(formData) && formData.includes(option);
                return (
                  <label
                    key={option}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleArrayChange(option)}
                      className="h-4 w-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {currentTask.dataType === 'file' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload a file
              {currentTask.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {currentTask.responseData?.filename ? (
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <File className="h-6 w-6 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium">{currentTask.responseData.originalName || 'File uploaded'}</p>
                    {currentTask.responseData.signedUrl && (
                      <a 
                        href={currentTask.responseData.signedUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary-500 hover:text-primary-700"
                      >
                        View file
                      </a>
                    )}
                  </div>
                </div>
                
                {/* Allow re-uploading a new file */}
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500"
                      >
                        <span>Upload a new file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF, DOC up to 10MB</p>
                    {file && (
                      <p className="text-sm font-medium text-gray-900">New file: {file.name}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF, DOC up to 10MB</p>
                  {file && (
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task actions */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => handleSave(file ? [file] : undefined)}
          disabled={saving || completing}
          className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Progress
            </>
          )}
        </button>
        
        <button
          type="button"
          onClick={() => handleComplete(file ? [file] : undefined)}
          disabled={completing || currentTask.isCompleted}
          className="flex items-center px-4 py-2 text-white bg-primary-500 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {completing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Completing...
            </>
          ) : currentTask.isCompleted ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Completed
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Mark as Complete
            </>
          )}
        </button>
      </div>
    </div>
  );
}