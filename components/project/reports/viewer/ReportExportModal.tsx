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
          <h3 className="text-xl font-medium text-black">Export Report</h3>
          <button
            onClick={onClose}
            disabled={exporting}
            className="text-c4c-petrol hover:text-black disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-sm text-c4c-petrol">
            Choose your preferred export format. The report content will be exported for download.
          </p>

          {/* PDF Export Option */}
          <div className="border-2 border-c4c-grey-bg rounded-lg p-4 hover:border-c4c-petrol transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-c4c-tint-sage rounded-lg">
                    <FileText className="text-c4c-sage" size={24} />
                  </div>
                  <div>
                    <h4 className="font-medium text-black">PDF Document</h4>
                    <p className="text-xs text-c4c-petrol">Professional format, preserves layout</p>
                  </div>
                </div>
                <div className="ml-14 space-y-1">
                  <p className="text-sm text-black">
                    • Looks exactly like the on-screen report
                  </p>
                  <p className="text-sm text-black">
                    • Preserves all formatting, colors, and layout
                  </p>
                  <p className="text-sm text-black">
                    • Best for sharing and presentations
                  </p>
                  <p className="text-sm text-black">
                    • Cannot be easily edited
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleExport('pdf')}
                disabled={exporting}
                className="flex items-center space-x-2 px-4 py-2 bg-c4c-petrol text-white rounded-md hover:bg-c4c-petrol/90 disabled:opacity-50 disabled:cursor-not-allowed ml-4"
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
          <div className="border-2 border-c4c-grey-bg rounded-lg p-4 hover:border-c4c-petrol transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-c4c-tint-cyan rounded-lg">
                    <FileText className="text-c4c-cobalt" size={24} />
                  </div>
                  <div>
                    <h4 className="font-medium text-black">Word Document</h4>
                    <p className="text-xs text-c4c-petrol">Editable format, easy to customize</p>
                  </div>
                </div>
                <div className="ml-14 space-y-1">
                  <p className="text-sm text-black">
                    • Text-based format for easy editing
                  </p>
                  <p className="text-sm text-black">
                    • Can be copied into other reports
                  </p>
                  <p className="text-sm text-black">
                    • Compatible with Microsoft Word and Google Docs
                  </p>
                  <p className="text-sm text-black">
                    • Simplified formatting for better compatibility
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleExport('docx')}
                disabled={exporting}
                className="flex items-center space-x-2 px-4 py-2 bg-c4c-petrol text-white rounded-md hover:bg-c4c-petrol/90 disabled:opacity-50 disabled:cursor-not-allowed ml-4"
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

        <div className="bg-c4c-grey-bg rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Eye size={20} className="text-c4c-petrol flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-black mb-1">Export Preview</h4>
              <p className="text-sm text-c4c-petrol">
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
            className="px-4 py-2 border border-c4c-petrol text-c4c-petrol rounded-md hover:bg-c4c-grey-bg disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportExportModal;