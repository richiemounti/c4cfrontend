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

import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Home,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  CreditCard,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// ── Inbox components ─────────────────────────────────────────────────────────
import InboxTrigger from '@/components/inbox/InboxTrigger';
import InboxPanel from '@/components/inbox/InboxPanel';

const DashboardSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const params = useParams();
  const organizationId = params?.id as string;

  // Base menu items — Inbox is handled separately via InboxTrigger
  const baseMenuItems = [
    {
      icon: <Home size={20} />,
      name: 'Home',
      path: '/dashboard',
    },
    {
      icon: <CreditCard size={20} />,
      name: 'Order Management',
      path: '/dashboard/orders',
    },
    {
      icon: <Settings size={20} />,
      name: 'Settings',
      path: '/dashboard/settings',
    },
  ];

  const menuItems = organizationId
    ? [
        ...baseMenuItems.slice(0, 1),
        {
          icon: <Users size={20} />,
          name: 'Users and Permissions',
          path: `/dashboard/organization/${organizationId}/users`,
        },
        ...baseMenuItems.slice(1),
      ]
    : baseMenuItems;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigate = (path: string) => router.push(path);

  const SidebarItem = ({ item, collapsed }: { item: any; collapsed: boolean }) => {
    const isActive = pathname === item.path;
    return (
      <button
        onClick={() => handleNavigate(item.path)}
        className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start'} my-1 px-3 py-2 rounded-md transition-colors relative group text-sm ${
          isActive
            ? 'bg-sky text-white hover:bg-sky-500'
            : 'text-sky-500 hover:text-white hover:bg-stratosphere-500'
        }`}
        title={collapsed ? item.name : undefined}
      >
        <div className={collapsed ? '' : 'mr-2 flex-shrink-0'}>{item.icon}</div>
        {!collapsed && <span className="text-left leading-tight">{item.name}</span>}
        {collapsed && (
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
            {item.name}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <div
        className={`hidden md:flex flex-col bg-stratosphere border-r border-stratosphere-500 min-h-screen ${
          collapsed ? 'w-16' : 'w-64'
        } transition-all duration-300 ease-in-out`}
      >
        {/* Logo */}
        <div
          className={`p-4 flex flex-col ${collapsed ? 'items-center' : ''} border-b border-stratosphere-500`}
        >
          <div
            className={`flex ${collapsed ? 'justify-center' : 'justify-between'} items-center w-full mb-2`}
          >
            {!collapsed && (
              <button onClick={() => router.push('/')} className="flex-shrink-0">
                <Image src="/levelnewlogo.PNG" alt="LEVEL" width={80} height={30} />
              </button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="text-sky-500 hover:text-white hover:bg-stratosphere-500"
            >
              {collapsed ? <Menu size={20} /> : <X size={20} />}
            </Button>
          </div>
          {!collapsed && (
            <div className="flex items-center justify-start w-full mt-1">
              <span className="text-[10px] text-white tracking-wide">
                Powered by{' '}
                <span className="font-semibold text-white">@ConnectGo</span>
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
          </nav>
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-stratosphere-500">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${
              collapsed ? 'justify-center' : 'justify-start'
            } px-3 py-2 rounded-md text-sky-500 hover:text-white hover:bg-stratosphere-500 transition-colors relative group text-sm`}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={20} className={collapsed ? '' : 'mr-2 flex-shrink-0'} />
            {!collapsed && <span className="leading-tight">Logout</span>}
            {collapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                Logout
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Sidebar ──────────────────────────────────────────────── */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed z-40 top-4 left-4 bg-stratosphere"
            >
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-stratosphere w-64 z-50">
            <div className="p-4 border-b border-stratosphere-500">
              <button onClick={() => router.push('/')} className="flex-shrink-0 mb-2 block">
                <Image src="/levelnewlogo.PNG" alt="LEVEL" width={80} height={30} />
              </button>
              <div className="flex items-center mt-2">
                <span className="text-[10px] text-sky-300/60 tracking-wide">
                  Powered by{' '}
                  <span className="font-semibold text-sky-400">ConnectGo</span>
                </span>
              </div>
            </div>
            <div className="py-4">
              <nav className="space-y-1 px-3">
                {menuItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-center justify-start my-1 px-3 py-2 rounded-md transition-colors text-sm ${
                        isActive
                          ? 'bg-sky text-white hover:bg-sky-500'
                          : 'text-sky-500 hover:text-white hover:bg-stratosphere-500'
                      }`}
                    >
                      <div className="mr-2 flex-shrink-0">{item.icon}</div>
                      <span className="text-left leading-tight">{item.name}</span>
                    </button>
                  );
                })}

                {/* Mobile inbox trigger */}
                <InboxTrigger variant="sidebar" collapsed={false} />
              </nav>
            </div>
            <div className="p-3 border-t border-stratosphere-500 mt-auto">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-start px-3 py-2 rounded-md text-sky-500 hover:text-white hover:bg-stratosphere-500 transition-colors text-sm"
              >
                <LogOut size={20} className="mr-2 flex-shrink-0" />
                <span className="leading-tight">Logout</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default DashboardSidebar;