// app/admin/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

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
  const NavItem = ({ item, collapsed }: { item: typeof navItems[0], collapsed: boolean }) => {
    const active = isActive(item.href);
    
    return (
      <Link href={item.href} className="w-full block">
        <Button 
          variant="ghost" 
          className={`w-full justify-${collapsed ? 'center' : 'start'} my-1 ${
            active 
              ? 'bg-neutral text-white hover:bg-neutral-500' 
              : 'text-neutral-500 hover:text-white hover:bg-white/10'
          }`}
        >
          {collapsed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div><item.icon size={20} /></div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <>
              <div className="mr-3"><item.icon size={20} /></div>
              <span className="text-sm">{item.name}</span>
            </>
          )}
        </Button>
      </Link>
    );
  };

  if (loading || !isAuthenticated || !user?.isConnectGoStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-tint">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <InboxProvider />
      <InboxPanel /> 
      {/* Desktop Sidebar */}
      <div className={`hidden md:flex flex-col bg-petrol border-r border-petrol-500 min-h-screen ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out`}>
        {/* Header Section */}
        <div className={`p-4 flex ${collapsed ? 'justify-center' : 'justify-between'} items-center border-b border-petrol-500`}>
          {!collapsed && (
            <div className="flex items-center overflow-hidden">
              <Shield size={20} className="text-neutral-500 mr-2 flex-shrink-0" />
              <span className="text-lg font-semibold text-white truncate">Admin</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="flex-shrink-0 text-neutral-500 hover:text-white hover:bg-white/10"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>
        
        {/* Admin Panel Label */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-petrol-500">
            <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
            <p className="text-xs text-neutral-500">C4C Platform Management</p>
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
        <div className="p-3 border-t border-petrol-500">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`w-full justify-${collapsed ? 'center' : 'start'} text-neutral-500 hover:text-white hover:bg-white/10`}
          >
            {collapsed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div><LogOut size={20} /></div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Logout
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <>
                <LogOut size={20} className="mr-3" />
                <span className="text-sm">Logout</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar (Sheet from Shadcn) */}
      <div className="md:hidden">
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="fixed z-20 top-4 left-4 bg-petrol text-neutral-500 hover:text-white hover:bg-white/10"
            >
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 max-w-[280px] w-full bg-petrol">
            {/* Mobile Header */}
            <div className="p-4 border-b border-petrol-500">
              <div className="flex items-center">
                <Shield size={20} className="text-neutral-500 mr-2" />
                <span className="text-lg font-semibold text-white">ConnectGo Admin</span>
              </div>
            </div>
            
            {/* Admin Panel Label */}
            <div className="px-4 py-3 border-b border-petrol-500">
              <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
              <p className="text-xs text-neutral-500">C4C Platform Management</p>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="space-y-1 px-3">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      onClick={() => setIsMobileSidebarOpen(false)}
                    >
                      <Button 
                        variant="ghost"
                        className={`w-full justify-start my-1 ${
                          active 
                            ? 'bg-neutral text-white hover:bg-neutral-500' 
                            : 'text-neutral-500 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <div className="mr-3"><item.icon size={20} /></div>
                        <span className="text-sm">{item.name}</span>
                      </Button>
                    </Link>
                  );
                })}
                {/* Inbox */}
                <InboxTrigger variant="sidebar" collapsed={false} />
              </nav>
            </div>

            {/* Mobile Logout */}
            <div className="p-3 border-t border-petrol-500">
              <Button
                variant="ghost"
                onClick={() => {
                  handleLogout();
                  setIsMobileSidebarOpen(false);
                }}
                className="w-full justify-start text-neutral-500 hover:text-white hover:bg-white/10"
              >
                <LogOut size={20} className="mr-3" />
                <span className="text-sm">Logout</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-x-hidden bg-neutral-tint">
        {/* Mobile header space */}
        <div className="md:hidden h-16"></div>

        {/* Page content */}
        <main className="min-h-screen bg-neutral-tint">{children}</main>
      </div>
    </div>
  );
}