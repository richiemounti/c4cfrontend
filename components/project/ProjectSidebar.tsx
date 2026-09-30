// components/project/ProjectSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  LayoutTemplate,
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
import { NavPanelLink, NavPanelGroupLabel, NAV_PANEL_WIDTH } from '@/components/shared/NavPanel';

interface Module {
  icon: JSX.Element;
  name: string;
  path: string;
}

const ProjectSidebar = ({ projectId, projectName }: { projectId: string, projectName: string }) => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navGroups: { label: string; items: Module[] }[] = [
    {
      label: 'Map',
      items: [
        {
          icon: <LayoutTemplate size={20} />,
          name: 'Project Design',
          path: `/dashboard/project/${projectId}/setup`,
        },
        {
          icon: <Map size={20} />,
          name: 'Stakeholder Map',
          path: `/dashboard/project/${projectId}/stakeholders`,
        },
        {
          icon: <GitBranch size={20} />,
          name: 'Theory of Change',
          path: `/dashboard/project/${projectId}/theory-of-change`,
        },
      ],
    },
    {
      label: 'Listen',
      items: [
        {
          icon: <FileText size={20} />,
          name: 'Survey Builder',
          path: `/dashboard/project/${projectId}/surveys`,
        },
      ],
    },
    {
      label: 'Learn',
      items: [
        {
          icon: <AlertTriangle size={20} />,
          name: 'Risk Register',
          path: `/dashboard/project/${projectId}/risks`,
        },
        {
          icon: <PieChart size={20} />,
          name: 'Results Dashboard',
          path: `/dashboard/project/${projectId}/results`,
        },
      ],
    },
    {
      label: 'Show',
      items: [
        {
          icon: <ClipboardList size={20} />,
          name: 'Reports',
          path: `/dashboard/project/${projectId}/reports`,
        },
      ],
    },
    {
      label: 'Other',
      items: [
        {
          icon: <ClipboardCheck size={20} />,
          name: 'Reviews',
          path: `/dashboard/project/${projectId}/review`,
        },
      ],
    },
  ];

  return (
    <div
      className={`hidden md:flex flex-col bg-c4c-grey-bg border-r border-c4c-rule min-h-screen ${collapsed ? 'w-16' : ''} transition-all duration-300 ease-in-out`}
      style={collapsed ? undefined : { width: NAV_PANEL_WIDTH }}
    >
      {/* Back to Dashboard / Logo Section */}
      <div className={`p-4 flex ${collapsed ? 'justify-center' : 'justify-between'} items-center border-b border-c4c-rule`}>
        {!collapsed && (
          <div className="flex items-center overflow-hidden">
            <Link href="/dashboard" className="flex items-center font-title text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-c4c-petrol hover:text-black">
              <ArrowLeft size={13} className="mr-1.5 flex-shrink-0" />
              <span className="truncate">Dashboard</span>
            </Link>
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

      {/* Project Name */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-c4c-rule">
          <h2 className="truncate font-title text-base font-semibold text-black">{projectName}</h2>
          <p className="mt-1 font-title text-[9.5px] font-semibold uppercase tracking-[0.12em] text-c4c-petrol">Project Dashboard</p>
        </div>
      )}

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          <NavPanelLink
            href={`/dashboard/project/${projectId}`}
            icon={<Home size={20} />}
            label="Project Home"
            active={pathname === `/dashboard/project/${projectId}`}
            collapsed={collapsed}
          />
        </div>

        <nav className="mt-1 space-y-4">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <NavPanelGroupLabel collapsed={collapsed}>{group.label}</NavPanelGroupLabel>
              {group.items.map((module) => (
                <NavPanelLink
                  key={module.path}
                  href={module.path}
                  icon={module.icon}
                  label={module.name}
                  active={pathname === module.path || pathname.startsWith(module.path + '/')}
                  collapsed={collapsed}
                />
              ))}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default ProjectSidebar;