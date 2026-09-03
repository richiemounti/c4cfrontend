// components/VideoTutorialModal.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import VideoPlayer from '@/components/VideoPlayer';

export interface VideoTutorialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  title?: string;
}

const VideoTutorialModal = ({ open, onOpenChange, src, title }: VideoTutorialModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white border border-sky p-4">
        <DialogHeader>
          <DialogTitle>{title || 'Video Tutorial'}</DialogTitle>
        </DialogHeader>
        <VideoPlayer src={src} autoPlay controls />
      </DialogContent>
    </Dialog>
  );
};

export default VideoTutorialModal;
