// components/reports/ReportActions.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Eye, Download, Edit, Trash2, Share2, MoreHorizontal,
  FileText, FileSpreadsheet, File, Copy, Archive
} from 'lucide-react';
import { BaseReportData } from '@/types/reports';
import { canUserEditReport, canUserArchiveReport } from '@/lib/utils/reports';
import { useAuth } from '@/contexts/AuthContext';

interface ReportActionsProps {
  report: BaseReportData;
  onView: () => void;
  onEdit: () => void;
  onExport: (format: 'pdf' | 'excel' | 'csv') => void;
  onDelete: () => void;
  compact?: boolean;
  onClose?: () => void;
}

const ReportActions: React.FC<ReportActionsProps> = ({
  report,
  onView,
  onEdit,
  onExport,
  onDelete,
  compact = false,
  onClose
}) => {
  const { user } = useAuth();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const canEdit = canUserEditReport(report, user);
  const canArchive = canUserArchiveReport(report, user);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMainMenu(false);
        setShowExportMenu(false);
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleAction = (action: () => void) => {
    action();
    setShowMainMenu(false);
    setShowExportMenu(false);
    onClose?.();
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => handleAction(onView)}
          className="p-2 text-sky hover:text-stratosphere hover:bg-sky-tint rounded"
          title="View report"
        >
          <Eye size={16} />
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowMainMenu(!showMainMenu)}
            className="p-2 text-sky hover:text-stratosphere hover:bg-sky-tint rounded"
            title="More actions"
          >
            <MoreHorizontal size={16} />
          </button>
          
          {showMainMenu && (
            <div className="absolute right-0 top-8 z-20 bg-white border border-sky rounded-md shadow-lg py-1 min-w-[180px]">
              <button
                onClick={() => handleAction(onView)}
                className="w-full px-4 py-2 text-left text-sm text-stratosphere hover:bg-sky-tint flex items-center"
              >
                <Eye size={16} className="mr-3" />
                View Report
              </button>
              
              {canEdit && (
                <button
                  onClick={() => handleAction(onEdit)}
                  className="w-full px-4 py-2 text-left text-sm text-stratosphere hover:bg-sky-tint flex items-center"
                >
                  <Edit size={16} className="mr-3" />
                  Edit Report
                </button>
              )}
              
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="w-full px-4 py-2 text-left text-sm text-stratosphere hover:bg-sky-tint flex items-center justify-between"
                >
                  <span className="flex items-center">
                    <Download size={16} className="mr-3" />
                    Export
                  </span>
                  <span className="text-xs">→</span>
                </button>
                
                {showExportMenu && (
                  <div className="absolute left-full top-0 ml-1 bg-white border border-sky rounded-md shadow-lg py-1 min-w-[120px]">
                    <button
                      onClick={() => handleAction(() => onExport('pdf'))}
                      className="w-full px-4 py-2 text-left text-sm text-stratosphere hover:bg-sky-tint flex items-center"
                    >
                      <FileText size={14} className="mr-2" />
                      PDF
                    </button>
                    <button
                      onClick={() => handleAction(() => onExport('excel'))}
                      className="w-full px-4 py-2 text-left text-sm text-stratosphere hover:bg-sky-tint flex items-center"
                    >
                      <FileSpreadsheet size={14} className="mr-2" />
                      Excel
                    </button>
                    <button
                      onClick={() => handleAction(() => onExport('csv'))}
                      className="w-full px-4 py-2 text-left text-sm text-stratosphere hover:bg-sky-tint flex items-center"
                    >
                      <File size={14} className="mr-2" />
                      CSV
                    </button>
                  </div>
                )}
              </div>
              
              <button
                className="w-full px-4 py-2 text-left text-sm text-stratosphere hover:bg-sky-tint flex items-center"
              >
                <Share2 size={16} className="mr-3" />
                Share
              </button>
              
              <button
                className="w-full px-4 py-2 text-left text-sm text-stratosphere hover:bg-sky-tint flex items-center"
              >
                <Copy size={16} className="mr-3" />
                Duplicate
              </button>
              
              {canArchive && (
                <>
                  <div className="border-t border-sky-tint my-1"></div>
                  <button
                    onClick={() => handleAction(onDelete)}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <Archive size={16} className="mr-3" />
                    Archive
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full actions menu (for dropdowns)
  return (
    <div 
      className="bg-white border border-sky rounded-md shadow-lg py-1 min-w-[180px]"
      ref={dropdownRef}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => handleAction(onView)}
        className="w-full px-4 py-2 text-left text-sm text-stratosphere hover:bg-sky-tint flex items-center"
      >
        <Eye size={16} className="mr-3" />
        View Report
      </button>
      
      {canEdit && (
        <button
          onClick={() => handleAction(onEdit)}
          className="w-full px-4 py-2 text-left text-sm text-stratosphere hover:bg-sky-tint flex items-center"
        >
          <Edit size={16} className="mr-3" />
          Edit Report
        </button>
      )}
      
      <div className="relative">
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          className="w-full px-4 py-2 text-left text-sm text-stratosphere hover:bg-sky-tint flex items-center justify-between"
        >
          <span className="flex items-center">
            <Download size={16} className="mr-3" />
            Export
          </span>
          <span className="text-xs">→</span>
        </button>
        
        {showExportMenu && (
          <div className="absolute left-full top-0 ml-1 bg-white border border-sky rounded-md shadow-lg py-1 min-w-[120px]">
            <button
              onClick={() => handleAction(() => onExport('pdf'))}
              className="w-full px-4 py-2 text-left text-sm text-stratosphere hover:bg-sky-tint flex items-center"
            >
              <FileText size={14} className="mr-2" />
              PDF
            </button>
            <button
              onClick={() => handleAction(() => onExport('excel'))}
              className="w-full px-4 py-2 text-left text-sm text-stratosphere hover:bg-sky-tint flex items-center"
            >
              <FileSpreadsheet size={14} className="mr-2" />
              Excel
            </button>
            <button
              onClick={() => handleAction(() => onExport('csv'))}
              className="w-full px-4 py-2 text-left text-sm text-stratosphere hover:bg-sky-tint flex items-center"
            >
              <File size={14} className="mr-2" />
              CSV
            </button>
          </div>
        )}
      </div>
      
      <button
        className="w-full px-4 py-2 text-left text-sm text-stratosphere hover:bg-sky-tint flex items-center"
      >
        <Share2 size={16} className="mr-3" />
        Share
      </button>
      
      <button
        className="w-full px-4 py-2 text-left text-sm text-stratosphere hover:bg-sky-tint flex items-center"
      >
        <Copy size={16} className="mr-3" />
        Duplicate
      </button>
      
      {canArchive && (
        <>
          <div className="border-t border-sky-tint my-1"></div>
          <button
            onClick={() => handleAction(onDelete)}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
          >
            <Archive size={16} className="mr-3" />
            Archive
          </button>
        </>
      )}
    </div>
  );
};

export default ReportActions;