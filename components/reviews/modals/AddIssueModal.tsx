// components/reviews/modals/AddIssueModal.tsx
'use client';

import React, { useState } from 'react';
import { IssueType, IssueSeverity } from '@/types';
import { addIssue } from '@/lib/api/reviews';
import { X, AlertCircle, Loader2 } from 'lucide-react';

interface AddIssueModalProps {
  reviewId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddIssueModal: React.FC<AddIssueModalProps> = ({
  reviewId,
  onClose,
  onSuccess,
}) => {
  const [issueType, setIssueType] = useState<IssueType>('validation');
  const [severity, setSeverity] = useState<IssueSeverity>('minor');
  const [description, setDescription] = useState('');
  const [field, setField] = useState('');
  const [suggestedFix, setSuggestedFix] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const issueTypes: { value: IssueType; label: string; description: string }[] = [
    { value: 'validation', label: 'Validation', description: 'Data validation errors or format issues' },
    { value: 'compliance', label: 'Compliance', description: 'Regulatory or policy compliance issues' },
    { value: 'quality', label: 'Quality', description: 'Quality standards not met' },
    { value: 'completeness', label: 'Completeness', description: 'Missing or incomplete information' },
    { value: 'accuracy', label: 'Accuracy', description: 'Incorrect or inaccurate data' },
    { value: 'other', label: 'Other', description: 'Other types of issues' },
  ];

  const severityLevels: { value: IssueSeverity; label: string; description: string; color: string }[] = [
    { 
      value: 'minor', 
      label: 'Minor', 
      description: 'Low impact, can be addressed later',
      color: 'bg-grass-50 border-grass-100 text-grass-900'
    },
    { 
      value: 'major', 
      label: 'Major', 
      description: 'Significant impact, needs attention',
      color: 'bg-sand-50 border-sand-100 text-sand-900'
    },
    { 
      value: 'critical', 
      label: 'Critical', 
      description: 'Severe impact, requires immediate action',
      color: 'bg-clay-50 border-clay-100 text-clay-900'
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      setError('Please provide an issue description');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await addIssue(reviewId, {
        issueType,
        severity,
        description: description.trim(),
        field: field.trim() || undefined,
        suggestedFix: suggestedFix.trim() || undefined,
      });

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to add issue');
      }
    } catch (err: any) {
      console.error('Error adding issue:', err);
      setError(err.response?.data?.error || 'Failed to add issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-concrete-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-clay-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-clay-900" />
            </div>
            <h2 className="text-xl font-semibold text-stratosphere-900">
              Add Issue
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-concrete-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-concrete-900" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Issue Type */}
          <div className="mb-6">
            <label className="text-sm font-medium text-stratosphere-900 mb-2 block">
              Issue Type <span className="text-clay-900">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {issueTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-start gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    issueType === type.value
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-concrete-500 hover:bg-concrete-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="issueType"
                    value={type.value}
                    checked={issueType === type.value}
                    onChange={(e) => setIssueType(e.target.value as IssueType)}
                    className="mt-1 text-sky-500 focus:ring-sky-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stratosphere-900">
                      {type.label}
                    </p>
                    <p className="text-xs text-concrete-900 mt-1">
                      {type.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div className="mb-6">
            <label className="text-sm font-medium text-stratosphere-900 mb-2 block">
              Severity <span className="text-clay-900">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {severityLevels.map((level) => (
                <label
                  key={level.value}
                  className={`flex flex-col gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    severity === level.value
                      ? `${level.color} border-2`
                      : 'border-concrete-500 hover:bg-concrete-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="severity"
                    value={level.value}
                    checked={severity === level.value}
                    onChange={(e) => setSeverity(e.target.value as IssueSeverity)}
                    className="text-sky-500 focus:ring-sky-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-stratosphere-900">
                      {level.label}
                    </p>
                    <p className="text-xs text-concrete-900 mt-1">
                      {level.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="text-sm font-medium text-stratosphere-900 mb-2 block">
              Issue Description <span className="text-clay-900">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              className="w-full px-3 py-2 border border-concrete-500 rounded-lg text-sm resize-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              rows={4}
              required
            />
            <p className="text-xs text-concrete-900 mt-1">
              Be specific about what the problem is
            </p>
          </div>

          {/* Field (Optional) */}
          <div className="mb-6">
            <label className="text-sm font-medium text-stratosphere-900 mb-2 block">
              Related Field (Optional)
            </label>
            <input
              type="text"
              value={field}
              onChange={(e) => setField(e.target.value)}
              placeholder="e.g., email, phoneNumber, address.city"
              className="w-full px-3 py-2 border border-concrete-500 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <p className="text-xs text-concrete-900 mt-1">
              If the issue is related to a specific field or data point
            </p>
          </div>

          {/* Suggested Fix (Optional) */}
          <div className="mb-6">
            <label className="text-sm font-medium text-stratosphere-900 mb-2 block">
              Request to reviewer (Optional)
            </label>
            <textarea
              value={suggestedFix}
              onChange={(e) => setSuggestedFix(e.target.value)}
              placeholder="Suggest how this issue can be resolved..."
              className="w-full px-3 py-2 border border-concrete-500 rounded-lg text-sm resize-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              rows={3}
            />
            <p className="text-xs text-concrete-900 mt-1">
              Provide recommendations for fixing this issue
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-clay-50 border border-clay-100 rounded-lg text-sm text-clay-900">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-concrete-500 text-stratosphere-900 rounded-lg hover:bg-concrete-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !description.trim()}
              className="flex-1 px-4 py-2 bg-clay-500 text-white rounded-lg hover:bg-clay-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding Issue...</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>Add Issue</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIssueModal;