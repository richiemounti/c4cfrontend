// components/project/ProjectSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight,
  Map,
  GitBranch,
  FileText,
  PieChart,
  AlertTriangle,
  ClipboardCheck,
  ClipboardList,
  ArrowLeft,
  Home
} from 'lucide-react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Module {
  icon: JSX.Element;
  name: string;
  path: string;
}

const ProjectSidebar = ({ projectId, projectName }: { projectId: string, projectName: string }) => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // OLD: const modules: Module[] = [...]

  // NEW: Categorized modules
  const designModules: Module[] = [
    {
      icon: <Map size={20} />,
      name: 'Stakeholder Mapping',
      path: `/dashboard/project/${projectId}/stakeholders`,
    },
    {
      icon: <GitBranch size={20} />,
      name: 'Theory of Change',
      path: `/dashboard/project/${projectId}/theory-of-change`,
    },
  ];

  const buildModules: Module[] = [
    {
      icon: <FileText size={20} />,
      name: 'Build Survey',
      path: `/dashboard/project/${projectId}/surveys/intro/`,
    },
  ];

  const measureModules: Module[] = [
    {
      icon: <PieChart size={20} />,
      name: 'Visualize Results',
      path: `/dashboard/project/${projectId}/results`,
    },
  ];

  const learnModules: Module[] = [
    {
      icon: <AlertTriangle size={20} />,
      name: 'Risk Register',
      path: `/dashboard/project/${projectId}/risks`,
    },
    {
      icon: <ClipboardList size={20} />,
      name: 'Reports',
      path: `/dashboard/project/${projectId}/reports`,
    },

  ];

  const otherModules: Module[] = [
    {
      icon: <ClipboardCheck size={20} />,
      name: 'Reviews',
      path: `/dashboard/project/${projectId}/review`,
    }
  ];

  // Module item component
  const ModuleItem = ({ module, collapsed }: { module: Module, collapsed: boolean }) => {
    const isActive = pathname === module.path || pathname.startsWith(module.path + '/');
    
    return (
      <Link href={module.path} className="w-full block">
        <Button 
          variant="ghost" 
          className={`w-full justify-${collapsed ? 'center' : 'start'} my-1 ${
            isActive 
              ? 'bg-sky text-white hover:bg-sky-500' 
              : 'text-sky-500 hover:text-white hover:bg-stratosphere-500'
          }`}
        >
          {collapsed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>{module.icon}</div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {module.name}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <>
              <div className="mr-3">{module.icon}</div>
              <span className="text-sm">{module.name}</span>
            </>
          )}
        </Button>
      </Link>
    );
  };

  return (
    <div className={`hidden md:flex flex-col bg-stratosphere border-r border-stratosphere-500 min-h-screen ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out`}>
      {/* Back to Dashboard / Logo Section */}
      <div className={`p-4 flex ${collapsed ? 'justify-center' : 'justify-between'} items-center border-b border-stratosphere-500`}>
        {!collapsed && (
          <div className="flex items-center overflow-hidden">
            <Link href="/dashboard" className="flex items-center text-sky-500 hover:text-white">
              <ArrowLeft size={16} className="mr-2 flex-shrink-0" />
              <span className="text-sm font-medium truncate">Dashboard</span>
            </Link>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="flex-shrink-0 text-white hover:bg-stratosphere-500"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>
      
      {/* Project Name */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-stratosphere-500">
          <h2 className="text-lg font-semibold truncate text-white">{projectName}</h2>
          <p className="text-xs text-sky-500">Project Dashboard</p>
        </div>
      )}
      
      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          <Link href={`/dashboard/project/${projectId}`} className="w-full block">
            <Button 
              variant="ghost" 
              className={`w-full justify-${collapsed ? 'center' : 'start'} my-1 ${
                pathname === `/dashboard/project/${projectId}` 
                  ? 'bg-sky text-white hover:bg-sky-500' 
                  : 'text-sky-500 hover:text-white hover:bg-stratosphere-500'
              }`}
            >
              {collapsed ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Home size={20} />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      Start Here
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <>
                  <Home size={20} className="mr-3" />
                  <span className="text-sm">Start Here</span>
                </>
              )}
            </Button>
          </Link>
        </div>
        
        {/* Module Divider */}
        <div className="my-4">
          {!collapsed && <p className="px-3 text-xs uppercase text-sky-500 mb-2">Modules</p>}
          <div className={collapsed ? "border-t border-stratosphere-500 my-2" : ""}></div>
        </div>
        
        {/* NEW CODE: */}
        {/* Design Modules */}
        <div className="my-4">
          {!collapsed && <p className="px-3 text-xs uppercase text-sky-500 mb-2">Design</p>}
          <div className={collapsed ? "border-t border-stratosphere-500 my-2" : ""}></div>
        </div>
        <nav className="space-y-1">
          {designModules.map((module) => (
            <ModuleItem 
              key={module.path} 
              module={module} 
              collapsed={collapsed} 
            />
          ))}
        </nav>

        {/* Build Modules */}
        <div className="my-4">
          {!collapsed && <p className="px-3 text-xs uppercase text-sky-500 mb-2">Build</p>}
          <div className={collapsed ? "border-t border-stratosphere-500 my-2" : ""}></div>
        </div>
        <nav className="space-y-1">
          {buildModules.map((module) => (
            <ModuleItem 
              key={module.path} 
              module={module} 
              collapsed={collapsed} 
            />
          ))}
        </nav>

        {/* Measure Modules */}
        <div className="my-4">
          {!collapsed && <p className="px-3 text-xs uppercase text-sky-500 mb-2">Measure</p>}
          <div className={collapsed ? "border-t border-stratosphere-500 my-2" : ""}></div>
        </div>
        <nav className="space-y-1">
          {measureModules.map((module) => (
            <ModuleItem 
              key={module.path} 
              module={module} 
              collapsed={collapsed} 
            />
          ))}
        </nav>

        {/* Learn Modules */}
        <div className="my-4">
          {!collapsed && <p className="px-3 text-xs uppercase text-sky-500 mb-2">Learn</p>}
          <div className={collapsed ? "border-t border-stratosphere-500 my-2" : ""}></div>
        </div>
        <nav className="space-y-1">
          {learnModules.map((module) => (
            <ModuleItem 
              key={module.path} 
              module={module} 
              collapsed={collapsed} 
            />
          ))}
        </nav>

        {/* Other Modules */}
        <div className="my-4">
          {!collapsed && <p className="px-3 text-xs uppercase text-sky-500 mb-2">Other</p>}
          <div className={collapsed ? "border-t border-stratosphere-500 my-2" : ""}></div>
        </div>
        <nav className="space-y-1">
          {otherModules.map((module) => (
            <ModuleItem 
              key={module.path} 
              module={module} 
              collapsed={collapsed} 
            />
          ))}
        </nav>
      </div>
    </div>
  );
};

export default ProjectSidebar;