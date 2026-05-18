// components/admin/bugs/BugReportFilters.tsx
import { FC, useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Filters {
  search: string;
  feedbackType: string;
  status: string;
  priority: string;
  urgencyLevel: string;
  category: string;
  bugType: string;
  affectedUsers: string;
  assignedToTeamMember: string; // NEW
  sourceText: string; // NEW (for searching source of feedback)
  verificationStatus: string; // NEW
}

interface BugReportFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const BugReportFilters: FC<BugReportFiltersProps> = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  // Feedback type options
  const feedbackTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'bug_report', label: 'Bug Reports' },
    { value: 'user_experience', label: 'User Experience' },
    { value: 'thematic_feedback', label: 'Thematic Feedback' },
    { value: 'feature_suggestion', label: 'Feature Suggestions' },
    { value: 'general_feedback', label: 'General Feedback' },
  ];

  // Enhanced status options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'new', label: 'New' },
    { value: 'triaged', label: 'Triaged' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'cannot-reproduce', label: 'Cannot Reproduce' },
    { value: 'duplicate', label: 'Duplicate' },
    { value: 'deferred', label: 'Deferred' },
  ];

  // Enhanced priority options
  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'p0', label: 'P0 - Critical' },
    { value: 'p1', label: 'P1 - High' },
    { value: 'p2', label: 'P2 - Medium' },
    { value: 'p3', label: 'P3 - Low' },
    { value: 'p4', label: 'P4 - Backlog' },
  ];

  // Urgency level options
  const urgencyOptions = [
    { value: 'all', label: 'All Turnaround Times' },
    { value: 'fix_24_hours', label: 'Fix within 24 hours' },
    { value: 'fix_1_3_days', label: 'Fix within 1-3 days' },
    { value: 'fix_this_week', label: 'Fix within this week' },
    { value: 'fix_2_weeks', label: 'Fix within 2 weeks' },
    { value: 'fix_next_month', label: 'Fix within next month' },
    { value: 'later', label: 'Later' },
  ];

  // Category options
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'functionality', label: 'Functionality' },
    { value: 'ui_ux', label: 'UI/UX' },
    { value: 'performance', label: 'Performance' },
    { value: 'security', label: 'Security' },
    { value: 'data_integrity', label: 'Data Integrity' },
    { value: 'integration', label: 'Integration' },
    { value: 'navigation', label: 'Navigation' },
    { value: 'layout', label: 'Layout' },
    { value: 'accessibility', label: 'Accessibility' },
    { value: 'responsiveness', label: 'Responsiveness' },
    { value: 'loading_speed', label: 'Loading Speed' },
    { value: 'visual_design', label: 'Visual Design' },
    { value: 'branding', label: 'Branding' },
    { value: 'color_scheme', label: 'Color Scheme' },
    { value: 'typography', label: 'Typography' },
    { value: 'iconography', label: 'Iconography' },
    { value: 'new_feature', label: 'New Feature' },
    { value: 'enhancement', label: 'Enhancement' },
    { value: 'workflow_improvement', label: 'Workflow Improvement' },
    { value: 'automation', label: 'Automation' },
    { value: 'copy', label: 'Copy (Text/Wording)' }, // NEW
    { value: 'other', label: 'Other' },
  ];

  // Effort options
  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'fix', label: 'Fix' },
    { value: 'food_for_thought', label: 'Food for Thought' },
    { value: 'pipeline', label: 'Pipeline' },
  ];

  // 5. ADD NEW TEAM MEMBER OPTIONS
  const teamMemberOptions = [
    { value: 'all', label: 'All Team Members' },
    { value: '', label: 'Unassigned' },
    { value: 'kate', label: 'Kate' },
    { value: 'sam', label: 'Sam' },
    { value: 'belinda', label: 'Belinda' },
  ];

  // NEW: Verification status options
  const verificationStatusOptions = [
    { value: 'all', label: 'All Verification States' },
    { value: 'unresolved', label: 'Unresolved' },
    { value: 'resolved_unverified', label: 'Resolved - Awaiting Verification' },
    { value: 'resolved_verified', label: 'Resolved & Verified' },
  ];

  // Affected users options
  const affectedUsersOptions = [
    { value: 'all', label: 'All User Groups' },
    { value: 'all', label: 'All Users' },
    { value: 'most', label: 'Most Users' },
    { value: 'many', label: 'Many Users' },
    { value: 'some', label: 'Some Users' },
    { value: 'few', label: 'Few Users' },
  ];

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (field: keyof Filters, value: string) => {
    const updatedFilters = { ...localFilters, [field]: value };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  // Handle search input with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalFilters(prev => ({ ...prev, search: value }));
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      onFilterChange({ ...localFilters, search: value });
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  // Clear all filters
  const clearAllFilters = () => {
    const clearedFilters: Filters = {
      search: '',
      feedbackType: 'all',
      status: 'all',
      priority: 'all',
      urgencyLevel: 'all',
      category: 'all',
      bugType: 'all',
      affectedUsers: 'all',
      assignedToTeamMember: 'all', // NEW
      sourceText: '', // NEW
      verificationStatus: 'all' // NEW
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  // Count active filters
  const activeFiltersCount = Object.entries(localFilters).filter(([key, value]) => 
    key !== 'search' && value !== 'all'
  ).length;

  return (
    <div className="space-y-6">
      {/* Search and Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sky-500" />
          <Input
            placeholder="Search reports by title, description, or tags..."
            value={localFilters.search}
            onChange={handleSearchChange}
            className="pl-10 border-concrete-500/30 focus:border-coral-500 focus:ring-coral-500/20"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Badge className="bg-coral-50 text-coral-600 border-coral-500/20">
              {activeFiltersCount} filters active
            </Badge>
          )}
          
          <Button
            onClick={clearAllFilters}
            variant="outline"
            size="sm"
            className="border-coral-500/30 text-coral-500 hover:bg-coral-50"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Filter Grid - Primary Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-stratosphere-900 mb-2">
            Feedback Type
          </label>
          <Select value={localFilters.feedbackType} onValueChange={(value) => handleFilterChange('feedbackType', value)}>
            <SelectTrigger className="border-concrete-500/30 focus:border-coral-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {feedbackTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stratosphere-900 mb-2">
            Status
          </label>
          <Select value={localFilters.status} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger className="border-concrete-500/30 focus:border-coral-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stratosphere-900 mb-2">
            Priority
          </label>
          <Select value={localFilters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
            <SelectTrigger className="border-concrete-500/30 focus:border-coral-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stratosphere-900 mb-2">
            Urgency Level
          </label>
          <Select value={localFilters.urgencyLevel} onValueChange={(value) => handleFilterChange('urgencyLevel', value)}>
            <SelectTrigger className="border-concrete-500/30 focus:border-coral-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {urgencyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Secondary Filters - UPDATED */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-stratosphere-900 mb-2">
            Category
          </label>
          <Select value={localFilters.category} onValueChange={(value) => handleFilterChange('category', value)}>
            <SelectTrigger className="border-concrete-500/30 focus:border-coral-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stratosphere-900 mb-2">
            Type
          </label>
          <Select value={localFilters.bugType} onValueChange={(value) => handleFilterChange('bugType', value)}>
            <SelectTrigger className="border-concrete-500/30 focus:border-coral-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stratosphere-900 mb-2">
            Assigned Team Member
          </label>
          <Select value={localFilters.assignedToTeamMember} onValueChange={(value) => handleFilterChange('assignedToTeamMember', value)}>
            <SelectTrigger className="border-concrete-500/30 focus:border-coral-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {teamMemberOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stratosphere-900 mb-2">
            Affected Users
          </label>
          <Select value={localFilters.affectedUsers} onValueChange={(value) => handleFilterChange('affectedUsers', value)}>
            <SelectTrigger className="border-concrete-500/30 focus:border-coral-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {affectedUsersOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stratosphere-900 mb-2">
            Verification Status
          </label>
          <Select value={localFilters.verificationStatus} onValueChange={(value) => handleFilterChange('verificationStatus', value)}>
            <SelectTrigger className="border-concrete-500/30 focus:border-coral-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {verificationStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      


      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-4 bg-coral-50 rounded-lg border border-coral-500/20">
          <Filter className="h-4 w-4 text-coral-500" />
          <span className="text-sm font-medium text-coral-700">Active Filters:</span>
          
          {Object.entries(localFilters).map(([key, value]) => {
            if (key === 'search' || value === 'all') return null;
            
            const filterLabels: Record<string, string> = {
              feedbackType: 'Type',
              status: 'Status',
              priority: 'Priority',
              urgencyLevel: 'Turnaround',
              category: 'Category',
              bugType: 'Type',
              affectedUsers: 'Users',
              assignedToTeamMember: 'Assigned To', // NEW
              sourceText: 'Source', // NEW
              verificationStatus: 'Verification' // NEW
            };
            
            return (
              <Badge
                key={key}
                className="bg-white border-coral-500/30 text-coral-700 hover:bg-coral-100 cursor-pointer"
                onClick={() => handleFilterChange(key as keyof Filters, 'all')}
              >
                {filterLabels[key]}: {value}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BugReportFilters;