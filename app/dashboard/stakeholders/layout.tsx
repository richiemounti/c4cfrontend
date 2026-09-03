import InboxTrigger from '@/components/inbox/InboxTrigger';

export default function StakeholdersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InboxTrigger variant="floating" />
    </>
  );
}
