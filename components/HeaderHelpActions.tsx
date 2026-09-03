// components/HeaderHelpActions.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, PlayCircle, MessageCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInboxStore } from '@/stores/useInboxStore';
import { getOrganizationAccountManager } from '@/lib/api/organization';
import VideoTutorialModal from '@/components/VideoTutorialModal';

// Shown when a page has no page-specific tutorial configured
const GENERIC_TUTORIAL_VIDEO = '/videos/instructional/general/getting-started.mp4';
const GENERIC_TUTORIAL_TITLE = 'Getting Started with Citizens for Change';

// Last-resort contact if no account manager can be resolved at all
const FALLBACK_SUPPORT_EMAIL = 'hannah@citizens4change.net';

export interface HeaderHelpActionsProps {
  organizationId: string;
  guideHref?: string;
  videoSrc?: string;
  videoTitle?: string;
  className?: string;
}

const HeaderHelpActions = ({
  organizationId,
  guideHref,
  videoSrc,
  videoTitle,
  className,
}: HeaderHelpActionsProps) => {
  const [videoOpen, setVideoOpen] = useState(false);
  const [contacting, setContacting] = useState(false);
  const { toast } = useToast();
  const startConversation = useInboxStore((s) => s.startConversation);
  const openConversation = useInboxStore((s) => s.openConversation);
  const openPanel = useInboxStore((s) => s.openPanel);

  const handleContactAccountManager = async () => {
    if (contacting) return;
    setContacting(true);
    try {
      const response = await getOrganizationAccountManager(organizationId);
      const accountManager = response.data;

      if (!accountManager) {
        toast({
          title: 'No account manager available',
          description: `Please email ${FALLBACK_SUPPORT_EMAIL} for help instead.`,
          variant: 'destructive',
        });
        return;
      }

      const conversation = await startConversation({
        type: 'direct',
        participantIds: [accountManager._id],
        organizationId,
      });
      await openConversation(conversation._id);
      openPanel('messages');
    } catch (error) {
      console.error('Failed to start conversation with account manager:', error);
      toast({
        title: "Couldn't open the inbox",
        description: `Please email ${FALLBACK_SUPPORT_EMAIL} for help instead.`,
        variant: 'destructive',
      });
    } finally {
      setContacting(false);
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-4 mt-2 ${className || ''}`}>
      {guideHref && (
        <Link
          href={guideHref}
          className="inline-flex items-center text-sm text-sky-500 hover:text-stratosphere"
        >
          <BookOpen size={14} className="mr-1" />
          Read module guide
        </Link>
      )}

      <button
        type="button"
        onClick={() => setVideoOpen(true)}
        className="inline-flex items-center text-sm text-sky-500 hover:text-stratosphere"
      >
        <PlayCircle size={14} className="mr-1" />
        Watch module video tutorial
      </button>

      <button
        type="button"
        onClick={handleContactAccountManager}
        disabled={contacting}
        className="inline-flex items-center text-sm text-sky-500 hover:text-stratosphere disabled:opacity-60"
      >
        {contacting ? (
          <Loader2 size={14} className="mr-1 animate-spin" />
        ) : (
          <MessageCircle size={14} className="mr-1" />
        )}
        Message Mentor
      </button>

      <VideoTutorialModal
        open={videoOpen}
        onOpenChange={setVideoOpen}
        src={videoSrc || GENERIC_TUTORIAL_VIDEO}
        title={videoTitle || GENERIC_TUTORIAL_TITLE}
      />
    </div>
  );
};

export default HeaderHelpActions;
