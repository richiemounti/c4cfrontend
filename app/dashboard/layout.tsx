// app/dashboard/layout.tsx
import InboxProvider from '@/components/inbox/InboxProvider';
import InboxPanel from '@/components/inbox/InboxPanel';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <InboxProvider />
      <InboxPanel />
      {children}
    </>
  );
}