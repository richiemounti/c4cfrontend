// app/dashboard/(main)/layout.tsx
import DashboardSidebar from '@/components/DashboardSidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-sky-tint">
      <DashboardSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}