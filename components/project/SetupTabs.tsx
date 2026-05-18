// components/project/SetupTabs.tsx
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectSetupTasks from './ProjectSetupTasks';
import ProjectSiteSetupTasks from './ProjectSiteSetupTasks';

interface SetupTabsProps {
  projectId: string;
  siteId?: string;
  defaultTab?: 'project' | 'site';
}

const SetupTabs: React.FC<SetupTabsProps> = ({ 
  projectId, 
  siteId, 
  defaultTab = 'project' 
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'project' | 'site');
  };

  return (
    <Tabs 
      defaultValue={defaultTab} 
      onValueChange={handleTabChange} 
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="project">Project Setup</TabsTrigger>
        <TabsTrigger 
          value="site" 
          disabled={!siteId}
        >
          Site Setup
        </TabsTrigger>
      </TabsList>
      <TabsContent value="project">
        <ProjectSetupTasks projectId={projectId} />
      </TabsContent>
      <TabsContent value="site">
        {siteId ? (
          <ProjectSiteSetupTasks siteId={siteId} />
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">
              Please select a project site first to view site setup tasks.
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default SetupTabs;