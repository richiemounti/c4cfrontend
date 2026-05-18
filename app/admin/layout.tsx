// app/admin/layout.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  BookOpen,
  Users,
  UserCog2,
  Settings,
  FolderTree,
  FileQuestion,
  BarChart,
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
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
              ? 'bg-sky text-white hover:bg-sky-500' 
              : 'text-sky-500 hover:text-white hover:bg-stratosphere-500'
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

  return (
    <div className="flex min-h-screen">
      <InboxProvider /> 
      <InboxPanel /> 
      {/* Desktop Sidebar */}
      <div className={`hidden md:flex flex-col bg-stratosphere border-r border-stratosphere-500 min-h-screen ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out`}>
        {/* Header Section */}
        <div className={`p-4 flex ${collapsed ? 'justify-center' : 'justify-between'} items-center border-b border-stratosphere-500`}>
          {!collapsed && (
            <div className="flex items-center overflow-hidden">
              <Shield size={20} className="text-sky-500 mr-2 flex-shrink-0" />
              <span className="text-lg font-semibold text-white truncate">Admin</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="flex-shrink-0 text-sky-500 hover:text-white hover:bg-stratosphere-500"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>
        
        {/* Admin Panel Label */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-stratosphere-500">
            <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
            <p className="text-xs text-sky-500">C4C Platform Management</p>
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
        <div className="p-3 border-t border-stratosphere-500">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`w-full justify-${collapsed ? 'center' : 'start'} text-sky-500 hover:text-white hover:bg-stratosphere-500`}
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
              className="fixed z-20 top-4 left-4 bg-stratosphere text-sky-500 hover:text-white hover:bg-stratosphere-500"
            >
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 max-w-[280px] w-full bg-stratosphere">
            {/* Mobile Header */}
            <div className="p-4 border-b border-stratosphere-500">
              <div className="flex items-center">
                <Shield size={20} className="text-sky-500 mr-2" />
                <span className="text-lg font-semibold text-white">ConnectGo Admin</span>
              </div>
            </div>
            
            {/* Admin Panel Label */}
            <div className="px-4 py-3 border-b border-stratosphere-500">
              <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
              <p className="text-xs text-sky-500">C4C Platform Management</p>
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
                            ? 'bg-sky text-white hover:bg-sky-500' 
                            : 'text-sky-500 hover:text-white hover:bg-stratosphere-500'
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
            <div className="p-3 border-t border-stratosphere-500">
              <Button
                variant="ghost"
                onClick={() => {
                  handleLogout();
                  setIsMobileSidebarOpen(false);
                }}
                className="w-full justify-start text-sky-500 hover:text-white hover:bg-stratosphere-500"
              >
                <LogOut size={20} className="mr-3" />
                <span className="text-sm">Logout</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-x-hidden bg-sky-tint">
        {/* Mobile header space */}
        <div className="md:hidden h-16"></div>

        {/* Page content */}
        <main className="min-h-screen bg-sky-tint">{children}</main>
      </div>
    </div>
  );
}