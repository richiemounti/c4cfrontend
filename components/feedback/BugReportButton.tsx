// components/feedback/BugReportButton.tsx
'use client'

import { useState } from 'react';
import { Bug } from 'lucide-react';
import BugReportModal from './BugReportModal';

const BugReportButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <button
        onClick={openModal}
        className="fixed bottom-6 left-6 z-50 rounded-full bg-stratosphere p-3 text-white shadow-lg hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label="Report a bug"
      >
        <Bug className="h-5 w-5" />
      </button>

      <BugReportModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

export default BugReportButton;