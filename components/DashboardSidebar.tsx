// ─── CHANGES TO DashboardSidebar.tsx ─────────────────────────────────────────
//
// 1. Remove the existing Inbox item from baseMenuItems
// 2. Import InboxTrigger and InboxPanel
// 3. Render <InboxTrigger variant="sidebar" collapsed={collapsed} />
//    in the nav where the old Inbox item was
// 4. Render <InboxPanel /> once, outside the nav (it's a portal/Sheet)
//
// Below is the complete updated file.
// ─────────────────────────────────────────────────────────────────────────────

'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Home,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  Receipt,
  LayoutDashboard,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isOrgAdmin } from '@/utils/permissions';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NavPanelLink, NAV_PANEL_WIDTH } from '@/components/shared/NavPanel';

// ── Inbox components ─────────────────────────────────────────────────────────
import InboxTrigger from '@/components/inbox/InboxTrigger';
import InboxPanel from '@/components/inbox/InboxPanel';

const DashboardSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const params = useParams();
  const organizationId = params?.id as string;
  const canManageOrg = organizationId && isOrgAdmin(user, organizationId);
  // "Home" means "the home of wherever you currently are" — inside an
  // organization's pages that's the org dashboard, everywhere else it's the
  // top-level dashboard (the organization list).
  const isOrgScoped = !!organizationId && pathname?.startsWith(`/dashboard/organization/${organizationId}`);
  const homePath = isOrgScoped ? `/dashboard/organization/${organizationId}` : '/dashboard';
  // The floating Inbox button (bottom-6 left-6) only renders on pages under
  // /dashboard/project/*, so Logout only needs clearance from it there.
  const needsFloatingInboxClearance = pathname?.startsWith('/dashboard/project/');

  // Order: Home, [Users and Permissions, Billing], Account Management, Inbox (via InboxTrigger), Settings
  const menuItems = [
    {
      icon: <Home size={20} />,
      name: 'Home',
      path: homePath,
    },
    ...(canManageOrg
      ? [
          {
            icon: <Users size={20} />,
            name: 'Users and Permissions',
            path: `/dashboard/organization/${organizationId}/users`,
          },
          {
            icon: <Receipt size={20} />,
            name: 'Billing',
            path: `/dashboard/organization/${organizationId}/billing`,
          },
        ]
      : []),
    // Account Management (admin builder) — ConnectGo staff only
    ...(user?.isConnectGoStaff
      ? [
          {
            icon: <LayoutDashboard size={20} />,
            name: 'Account Management',
            path: '/admin/',
          },
        ]
      : []),
  ];

  const settingsItem = {
    icon: <Settings size={20} />,
    name: 'Settings',
    path: '/dashboard/settings',
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigate = (path: string) => router.push(path);

  const SidebarItem = ({ item, collapsed }: { item: any; collapsed: boolean }) => (
    <NavPanelLink
      onClick={() => handleNavigate(item.path)}
      icon={item.icon}
      label={item.name}
      active={pathname === item.path}
      collapsed={collapsed}
    />
  );

  const LogoutItem = ({ collapsed }: { collapsed: boolean }) => (
    <NavPanelLink onClick={handleLogout} icon={<LogOut size={20} />} label="Logout" collapsed={collapsed} />
  );

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <div
        className={`hidden md:flex flex-col bg-c4c-grey-bg border-r border-c4c-rule min-h-screen ${
          collapsed ? 'w-16' : ''
        } transition-all duration-300 ease-in-out`}
        style={collapsed ? undefined : { width: NAV_PANEL_WIDTH }}
      >
        {/* Logo */}
        <div
          className={`p-4 flex flex-col ${collapsed ? 'items-center' : ''} border-b border-c4c-rule`}
        >
          <div
            className={`flex ${collapsed ? 'flex-col gap-2' : 'justify-between'} items-center w-full mb-2`}
          >
            <button
              onClick={() => router.push('/')}
              className="flex-shrink-0"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {/* Navy brand-tile — the mockup's rationale for this over the
                  full wordmark: it stays legible at sidebar width. */}
              <span className="flex h-[38px] w-[38px] items-center justify-center bg-c4c-petrol">
                <Image src="/icons/Brand Icon_white.png" alt="Citizens for Change" width={20} height={20} priority />
              </span>
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="text-c4c-petrol hover:bg-white hover:text-black"
            >
              {collapsed ? <Menu size={20} /> : <X size={20} />}
            </Button>
          </div>
          {!collapsed && (
            <div className="flex items-center justify-start w-full mt-1">
              <span className="text-[10px] text-c4c-petrol tracking-wide">
                Powered by{' '}
                <span className="font-semibold">@ConnectGo</span>
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <SidebarItem key={item.path} item={item} collapsed={collapsed} />
            ))}

            {/* ── Inbox trigger — replaces old static Inbox link ── */}
            <InboxTrigger variant="sidebar" collapsed={collapsed} />

            <SidebarItem item={settingsItem} collapsed={collapsed} />
          </nav>
        </div>

        {/* Logout */}
        {/* Extra bottom padding keeps this clear of the fixed floating Inbox button (bottom-6 left-6) when it's on-screen */}
        <div className={`p-3 border-t border-c4c-rule ${needsFloatingInboxClearance ? 'pb-20' : ''}`}>
          <LogoutItem collapsed={collapsed} />
        </div>
      </div>

      {/* ── Mobile Sidebar ──────────────────────────────────────────────── */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed z-40 top-4 left-4 bg-c4c-petrol text-white hover:bg-c4c-petrol/90 hover:text-white"
            >
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-c4c-grey-bg w-64 z-50">
            <div className="p-4 border-b border-c4c-rule">
              <button
                onClick={() => router.push('/')}
                className="flex-shrink-0 mb-2 block text-left"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <span className="flex h-[38px] w-[38px] items-center justify-center bg-c4c-petrol">
                  <Image src="/icons/Brand Icon_white.png" alt="Citizens for Change" width={20} height={20} />
                </span>
              </button>
              <div className="flex items-center mt-2">
                <span className="text-[10px] text-c4c-petrol tracking-wide">
                  Powered by{' '}
                  <span className="font-semibold">ConnectGo</span>
                </span>
              </div>
            </div>
            <div className="py-4">
              <nav className="space-y-1 px-3">
                {menuItems.map((item) => (
                  <SidebarItem key={item.path} item={item} collapsed={false} />
                ))}

                {/* Mobile inbox trigger */}
                <InboxTrigger variant="sidebar" collapsed={false} />

                <SidebarItem item={settingsItem} collapsed={false} />
              </nav>
            </div>
            {/* Extra bottom padding keeps this clear of the fixed floating Inbox button (bottom-6 left-6) when it's on-screen */}
            <div className={`p-3 border-t border-c4c-rule mt-auto ${needsFloatingInboxClearance ? 'pb-20' : ''}`}>
              <LogoutItem collapsed={false} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default DashboardSidebar;