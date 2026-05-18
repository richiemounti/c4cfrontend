// components/reports/viewer/ReportExportModal.tsx
'use client';

import { useState } from 'react';
import { X, FileText, Download, Eye, Clock } from 'lucide-react';
import { BaseReportData } from '@/types/reports';
import { useToast } from '@/hooks/use-toast';
import { exportReportAsPDF, exportReportAsDOCX, triggerDownload } from '@/lib/api/reports/export';

interface ReportExportModalProps {
  report: BaseReportData;
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'docx') => void;
}

const ReportExportModal: React.FC<ReportExportModalProps> = ({
  report,
  isOpen,
  onClose,
  onExport
}) => {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'docx' | null>(null);

  if (!isOpen) return null;

  const handleExport = async (format: 'pdf' | 'docx') => {
    setExporting(true);
    setSelectedFormat(format);

    try {
      let blob: Blob;
      let filename: string;

      if (format === 'pdf') {
        blob = await exportReportAsPDF(report.id, {
          includeCharts: true,
          includeImages: true
        });
        filename = `${report.title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      } else {
        blob = await exportReportAsDOCX(report.id, {
          includeMetadata: true,
          includeTables: true
        });
        filename = `${report.title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
      }

      // Trigger download
      triggerDownload(blob, filename);

      toast({
        title: 'Export Successful',
        description: `Your ${format.toUpperCase()} file has been downloaded.`,
      });

      onExport(format);
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: `Failed to export report as ${format.toUpperCase()}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
      setSelectedFormat(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium text-stratosphere">Export Report</h3>
          <button
            onClick={onClose}
            disabled={exporting}
            className="text-sky hover:text-stratosphere disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-sm text-sky">
            Choose your preferred export format. The report content will be exported for download.
          </p>

          {/* PDF Export Option */}
          <div className="border-2 border-sky-tint rounded-lg p-4 hover:border-sky transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <FileText className="text-red-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-medium text-stratosphere">PDF Document</h4>
                    <p className="text-xs text-sky">Professional format, preserves layout</p>
                  </div>
                </div>
                <div className="ml-14 space-y-1">
                  <p className="text-sm text-stratosphere">
                    • Looks exactly like the on-screen report
                  </p>
                  <p className="text-sm text-stratosphere">
                    • Preserves all formatting, colors, and layout
                  </p>
                  <p className="text-sm text-stratosphere">
                    • Best for sharing and presentations
                  </p>
                  <p className="text-sm text-stratosphere">
                    • Cannot be easily edited
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleExport('pdf')}
                disabled={exporting}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed ml-4"
              >
                {exporting && selectedFormat === 'pdf' ? (
                  <>
                    <Clock size={16} className="animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Export PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* DOCX Export Option */}
          <div className="border-2 border-sky-tint rounded-lg p-4 hover:border-sky transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-medium text-stratosphere">Word Document</h4>
                    <p className="text-xs text-sky">Editable format, easy to customize</p>
                  </div>
                </div>
                <div className="ml-14 space-y-1">
                  <p className="text-sm text-stratosphere">
                    • Text-based format for easy editing
                  </p>
                  <p className="text-sm text-stratosphere">
                    • Can be copied into other reports
                  </p>
                  <p className="text-sm text-stratosphere">
                    • Compatible with Microsoft Word and Google Docs
                  </p>
                  <p className="text-sm text-stratosphere">
                    • Simplified formatting for better compatibility
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleExport('docx')}
                disabled={exporting}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ml-4"
              >
                {exporting && selectedFormat === 'docx' ? (
                  <>
                    <Clock size={16} className="animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Export DOCX</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-sky-tint rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Eye size={20} className="text-sky flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-stratosphere mb-1">Export Preview</h4>
              <p className="text-sm text-sky">
                The exported document will include all visible sections from the report content area.
                Workflow controls, metadata, and comments are not included in the export.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            disabled={exporting}
            className="px-4 py-2 border border-sky text-sky rounded-md hover:bg-sky-tint disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportExportModal;