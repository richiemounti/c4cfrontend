import InboxTrigger from '@/components/inbox/InboxTrigger';

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InboxTrigger variant="floating" />
    </>
  );
}
