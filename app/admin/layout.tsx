// app/admin/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutGrid,
  BookOpen,
  Users,
  UserCog2,
  Settings,
  FolderTree,
  FileQuestion,
  BarChart,
  Network,
  Menu,
  Bug,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { NavPanelLink, NAV_PANEL_WIDTH } from '@/components/shared/NavPanel';

import InboxProvider from '@/components/inbox/InboxProvider';
import InboxPanel from '@/components/inbox/InboxPanel';
import InboxTrigger from '@/components/inbox/InboxTrigger';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push('/account/login');
    } else if (!user?.isConnectGoStaff) {
      router.push('/unauthorized');
    }
  }, [loading, isAuthenticated, user, router]);

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutGrid,
    },
    // {
    //   name: 'Organizations',
    //   href: '/admin/organizations',
    //   icon: Users,
    // },
    {
      name: 'Categories',
      href: '/admin/categories',
      icon: FolderTree,
    },
    {
      name: 'Themes',
      href: '/admin/themes',
      icon: FolderTree,
    },
    {
      name: 'SubThemes',
      href: '/admin/subthemes',
      icon: FolderTree,
    },
    {
      name: 'Indicators',
      href: '/admin/indicators',
      icon: FolderTree,
    },
    {
      name: 'ESG Framework',
      href: '/admin/esg-categories',
      icon: FolderTree,
    },
    {
      name: 'Resilience Framework',
      href: '/admin/resilience-dimensions',
      icon: FolderTree,
    },
    {
      name: 'SDG Framework',
      href: '/admin/sdgs',
      icon: FolderTree,
    },
    {
      name: 'Standards',
      href: '/admin/standards',
      icon: FolderTree,
    },
    {
      name: 'Questions',
      href: '/admin/questions',
      icon: FileQuestion,
    },
    {
      name: 'Surveys',
      href: '/admin/surveys',
      icon: BookOpen,
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart,
    },
    {
      // Social Networks Instrument — a separate feature from the standard
      // survey builder above (see SNI_BUILD_PLAN.md). Staff-only authoring,
      // same as every other entry on this nav — client-facing nav placement
      // is a separate, still-open decision (build plan §7).
      name: 'SNI Surveys',
      href: '/admin/sni-surveys',
      icon: Network,
    },
    {
      name: 'Bugs',
      href: '/admin/bugs',
      icon: Bug
    },
    {
      name: 'User Roles',
      href: '/admin/users/roles',
      icon: UserCog2,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logging out...');
    // Example: router.push('/login');
  };

  // Sidebar navigation item component
  const NavItem = ({ item, collapsed }: { item: typeof navItems[0], collapsed: boolean }) => (
    <NavPanelLink
      href={item.href}
      icon={<item.icon size={20} />}
      label={item.name}
      active={isActive(item.href)}
      collapsed={collapsed}
    />
  );

  if (loading || !isAuthenticated || !user?.isConnectGoStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-c4c-grey-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-c4c-petrol"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <InboxProvider />
      <InboxPanel />
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex flex-col bg-c4c-grey-bg border-r border-c4c-rule min-h-screen ${collapsed ? 'w-16' : ''} transition-all duration-300 ease-in-out`}
        style={collapsed ? undefined : { width: NAV_PANEL_WIDTH }}
      >
        {/* Header Section */}
        <div className={`p-4 flex ${collapsed ? 'justify-center' : 'justify-between'} items-center border-b border-c4c-rule`}>
          {!collapsed && (
            <div className="flex items-center overflow-hidden">
              <Shield size={18} className="text-c4c-petrol mr-2 flex-shrink-0" />
              <span className="font-title text-base font-semibold text-black truncate">Admin</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="flex-shrink-0 text-c4c-petrol hover:bg-white hover:text-black"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>

        {/* Admin Panel Label */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-c4c-rule">
            <h2 className="font-title text-base font-semibold text-black">Admin Panel</h2>
            <p className="mt-1 font-title text-[9.5px] font-semibold uppercase tracking-[0.12em] text-c4c-petrol">C4C Platform Management</p>
          </div>
        )}

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                collapsed={collapsed}
              />
            ))}
            {/* Inbox */}
            <InboxTrigger variant="sidebar" collapsed={collapsed} />
          </nav>
        </div>

        {/* Logout Section */}
        <div className="p-3 border-t border-c4c-rule">
          <NavPanelLink onClick={handleLogout} icon={<LogOut size={20} />} label="Logout" collapsed={collapsed} />
        </div>
      </div>

      {/* Mobile Sidebar (Sheet from Shadcn) */}
      <div className="md:hidden">
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed z-20 top-4 left-4 bg-c4c-petrol text-white hover:bg-c4c-petrol/90 hover:text-white"
            >
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 max-w-[280px] w-full bg-c4c-grey-bg">
            {/* Mobile Header */}
            <div className="p-4 border-b border-c4c-rule">
              <div className="flex items-center">
                <Shield size={18} className="text-c4c-petrol mr-2" />
                <span className="font-title text-base font-semibold text-black">ConnectGo Admin</span>
              </div>
            </div>

            {/* Admin Panel Label */}
            <div className="px-4 py-3 border-b border-c4c-rule">
              <h2 className="font-title text-base font-semibold text-black">Admin Panel</h2>
              <p className="mt-1 font-title text-[9.5px] font-semibold uppercase tracking-[0.12em] text-c4c-petrol">C4C Platform Management</p>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="space-y-1 px-3">
                {navItems.map((item) => (
                  <div key={item.href} onClick={() => setIsMobileSidebarOpen(false)}>
                    <NavItem item={item} collapsed={false} />
                  </div>
                ))}
                {/* Inbox */}
                <InboxTrigger variant="sidebar" collapsed={false} />
              </nav>
            </div>

            {/* Mobile Logout */}
            <div className="p-3 border-t border-c4c-rule">
              <NavPanelLink
                onClick={() => {
                  handleLogout();
                  setIsMobileSidebarOpen(false);
                }}
                icon={<LogOut size={20} />}
                label="Logout"
                collapsed={false}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-x-hidden bg-c4c-grey-bg">
        {/* Mobile header space */}
        <div className="md:hidden h-16"></div>

        {/* Page content */}
        <main className="min-h-screen bg-c4c-grey-bg">{children}</main>
      </div>
    </div>
  );
}