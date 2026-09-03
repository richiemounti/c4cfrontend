import InboxTrigger from '@/components/inbox/InboxTrigger';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InboxTrigger variant="floating" />
    </>
  );
}
