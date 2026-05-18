// components/admin/users/RoleAssignmentForm.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { getOrganizationProjects } from '@/lib/api/project';
import { assignRole, RoleData } from '@/lib/api/user';
import { Project, Organization, RoleType } from '@/types';
import { Shield, Briefcase, Building, FolderOpen, Info, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RoleAssignmentFormProps {
  userId: string;
  organizations: Organization[];
  onRoleAssigned: () => void;
}

export default function RoleAssignmentForm({ 
  userId, 
  organizations, 
  onRoleAssigned 
}: RoleAssignmentFormProps) {
  const [role, setRole] = useState<RoleType | ''>('');
  const [organizationId, setOrganizationId] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [hoveredRole, setHoveredRole] = useState<RoleType | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ top: number; left: number } | null>(null);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Reset form when user changes
  useEffect(() => {
    setRole('');
    setOrganizationId('');
    setProjects([]);
    setSelectedProjects([]);
  }, [userId]);

  // Clear hover when select closes
  useEffect(() => {
    if (!isSelectOpen) {
      setHoveredRole(null);
      setHoverPosition(null);
    }
  }, [isSelectOpen]);

  // Fetch projects when organization is selected
  useEffect(() => {
    const fetchProjects = async () => {
      if (!organizationId) {
        setProjects([]);
        setSelectedProjects([]);
        return;
      }

      try {
        setLoading(true);
        const response = await getOrganizationProjects(organizationId, 1, 100);
        setProjects(response.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load projects",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [organizationId, toast]);

  const handleProjectToggle = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId) 
        : [...prev, projectId]
    );
  };

  const handleRoleHover = (r: RoleType, event: React.MouseEvent) => {
    setHoveredRole(r);
    const rect = event.currentTarget.getBoundingClientRect();
    setHoverPosition({
      top: rect.top,
      left: rect.right + 10 // 10px gap from the item
    });
  };

  const handleRoleLeave = () => {
    setHoveredRole(null);
    setHoverPosition(null);
  };

  const handleRoleChange = (value: string) => {
    setRole(value as RoleType | '');
    // Clear hover state when a role is selected
    setHoveredRole(null);
    setHoverPosition(null);
    setIsSelectOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!role) {
      toast({
        title: "Error",
        description: "Please select a role",
        variant: "destructive",
      });
      return;
    }

    const clientRoles = ['manager', 'projectCreator', 'leadership', 'hq', 'communications', 'fieldStaff', 'fieldAgent'];
    const rolesRequiringOrg = ['projectCreator', 'leadership', 'hq', 'communications', 'fieldStaff', 'fieldAgent'];
    
    if (rolesRequiringOrg.includes(role) && !organizationId) {
      toast({
        title: "Error",
        description: "Please select an organization for this role",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const roleData: RoleData = {
        role,
        ...(organizationId && { organizationId }),
        ...(selectedProjects.length > 0 && { projectIds: selectedProjects })
      };
      
      await assignRole(userId, roleData);
      
      setRole('');
      setOrganizationId('');
      setSelectedProjects([]);
      
      onRoleAssigned();
      
      toast({
        title: "Success",
        description: "Role assigned successfully",
      });
    } catch (error) {
      console.error("Error assigning role:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign role",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const connectGoRoles: RoleType[] = ['owner', 'admin', 'accountManager', 'analyst'];
  const clientRoles: RoleType[] = ['manager', 'projectCreator', 'leadership', 'hq', 'communications', 'fieldStaff', 'fieldAgent'];

  const roleDescriptions: Record<RoleType, string> = {
    // ConnectGo Staff Roles
    owner: 'Full system access, billing, and user management',
    admin: 'Create clients, manage users, and system settings',
    accountManager: 'Manage client users and oversee projects',
    analyst: 'Visualize results and manage backend data entry',
    
    // Client Roles
    manager: 'Manage organization projects and approve submissions',
    projectCreator: 'Create and configure projects',
    leadership: 'View outputs: visualize results, build surveys, reports, risk register',
    hq: 'All leadership permissions plus review and approve submissions',
    communications: 'View outputs: visualize results, build surveys, reports, risk register',
    fieldStaff: 'Review submissions, stakeholder mapping, project/site setup, theory of change',
    fieldAgent: 'View assignments and submit data',
  };

  // Detailed role information with permissions
  const roleDetails: Record<RoleType, {
    description: string;
    permissions: string[];
    scope: string;
  }> = {
    // ConnectGo Staff Roles
    owner: {
      description: 'Ultimate system administrator with complete control',
      permissions: [
        'Manage all organizations and users',
        'Access billing and subscription settings',
        'Delete data across the platform',
        'Export all reports and data',
        'Configure system-wide settings'
      ],
      scope: 'Platform-wide access'
    },
    admin: {
      description: 'System administrator for platform management',
      permissions: [
        'Create and manage client organizations',
        'Manage user accounts and permissions',
        'Review system logs and activity',
        'Export system-level reports',
        'Configure platform settings'
      ],
      scope: 'Platform-wide access'
    },
    accountManager: {
      description: 'Client relationship manager',
      permissions: [
        'Manage client user accounts',
        'Oversee client projects',
        'Export client-specific reports',
        'Communicate with client organizations'
      ],
      scope: 'Platform-wide access'
    },
    analyst: {
      description: 'Data analysis and visualization specialist',
      permissions: [
        'Visualize and analyze results',
        'Manage backend data entry',
        'Generate analytical reports',
        'Access data across organizations'
      ],
      scope: 'Platform-wide access'
    },
    
    // Client Roles
    manager: {
      description: 'Organization administrator',
      permissions: [
        'Manage all organization projects',
        'Approve and reject submissions',
        'Assign roles to team members',
        'Invite new users to organization',
        'Export organization reports'
      ],
      scope: 'Organization-wide access'
    },
    projectCreator: {
      description: 'Project setup and configuration lead',
      permissions: [
        'Create new projects',
        'Configure project settings',
        'Manage project parameters',
        'Export project-specific reports'
      ],
      scope: 'Assigned projects only'
    },
    leadership: {
      description: 'Executive/managerial role with output visibility',
      permissions: [
        'View visualized results and dashboards',
        'Access survey building tools',
        'Generate and view reports',
        'Review risk registers',
        'Access learning and reporting tools'
      ],
      scope: 'Assigned projects only'
    },
    hq: {
      description: 'Headquarters staff with full visibility and approval authority',
      permissions: [
        'All leadership permissions',
        'Review field submissions',
        'Approve or reject submitted data',
        'Monitor data quality',
        'Oversee project progress'
      ],
      scope: 'Assigned projects only'
    },
    communications: {
      description: 'Communications and reporting specialist',
      permissions: [
        'View visualized results and dashboards',
        'Access survey building tools',
        'Generate and view reports',
        'Review risk registers',
        'Access learning and reporting tools'
      ],
      scope: 'Assigned projects only'
    },
    fieldStaff: {
      description: 'Field operations coordinator with elevated permissions',
      permissions: [
        'Review field submissions',
        'Manage stakeholder mapping',
        'Configure project and site setup',
        'Work on theory of change',
        'Coordinate field activities'
      ],
      scope: 'Assigned projects only'
    },
    fieldAgent: {
      description: 'Field data collector',
      permissions: [
        'View assigned tasks and surveys',
        'Submit field data and responses',
        'Access assignment details',
        'Basic field operations'
      ],
      scope: 'Assigned projects only'
    },
  };

  const showOrganizationField = Boolean(role) && clientRoles.includes(role as RoleType) && role !== 'manager';
  const showProjectsField = Boolean(organizationId) && ['projectCreator', 'leadership', 'hq', 'communications', 'fieldStaff', 'fieldAgent'].includes(role as RoleType);
  
  const isRoleEmpty = role === '';
  const isOrgRequired = showOrganizationField;
  const isOrgEmpty = organizationId === '';
  const shouldBeDisabled = submitting || isRoleEmpty || (isOrgRequired && isOrgEmpty);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Role Selection */}
      <div className="space-y-3" ref={selectRef}>
        <Label htmlFor="role" className="text-stratosphere-900 font-semibold flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary-500" />
          Select Role
          <span className="text-xs text-sky-500 font-normal">(Hover over roles for details)</span>
        </Label>
        <Select 
          value={role} 
          onValueChange={handleRoleChange}
          onOpenChange={setIsSelectOpen}
        >
          <SelectTrigger 
            id="role" 
            className="border-concrete-500 focus:border-primary-500 focus:ring-primary-500"
          >
            <SelectValue placeholder="Choose a role to assign" />
          </SelectTrigger>
          <SelectContent>
            <div className="px-2 py-1.5 text-xs font-semibold text-stratosphere-900 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-grass-500" />
              ConnectGo Staff Roles
            </div>
            {connectGoRoles.map(r => (
              <SelectItem 
                key={r} 
                value={r} 
                className="capitalize pl-6"
                onMouseEnter={(e) => handleRoleHover(r, e)}
                onMouseLeave={handleRoleLeave}
              >
                <div className="flex items-center gap-2">
                  <span>{r.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <Badge variant="outline" className="text-xs bg-grass-50 text-grass-700 border-grass-300">
                    Staff
                  </Badge>
                </div>
              </SelectItem>
            ))}
            <Separator className="my-1" />
            <div className="px-2 py-1.5 text-xs font-semibold text-stratosphere-900 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-sky-500" />
              Client Roles
            </div>
            {clientRoles.map(r => (
              <SelectItem 
                key={r} 
                value={r} 
                className="capitalize pl-6"
                onMouseEnter={(e) => handleRoleHover(r, e)}
                onMouseLeave={handleRoleLeave}
              >
                {r.replace(/([A-Z])/g, ' $1').trim()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {role && (
          <Alert className="border-sky-200 bg-sky-50">
            <Info className="h-4 w-4 text-sky-500" />
            <AlertDescription className="text-sm text-stratosphere-700">
              <strong className="capitalize">{(role as string).replace(/([A-Z])/g, ' $1').trim()}:</strong> {roleDescriptions[role as RoleType]}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Floating Role Info Card */}
      {hoveredRole && hoverPosition && isSelectOpen && (
        <div
          className="fixed z-[100] w-80 pointer-events-none"
          style={{
            top: `${hoverPosition.top}px`,
            left: `${hoverPosition.left}px`,
            transform: 'translateY(-20px)'
          }}
        >
          <Card className="border-2 border-sky-300 bg-white shadow-2xl">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="p-1.5 bg-sky-100 rounded">
                    {connectGoRoles.includes(hoveredRole) ? (
                      <Shield className="h-4 w-4 text-grass-700" />
                    ) : (
                      <Briefcase className="h-4 w-4 text-sky-700" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm text-stratosphere-900 capitalize">
                        {hoveredRole.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <Badge className={connectGoRoles.includes(hoveredRole) ? "bg-grass-500 text-white text-xs" : "bg-sky-500 text-white text-xs"}>
                        {connectGoRoles.includes(hoveredRole) ? 'Staff' : 'Client'}
                      </Badge>
                    </div>
                    <p className="text-xs text-stratosphere-600">
                      {roleDetails[hoveredRole].description}
                    </p>
                  </div>
                </div>

                <Separator className="bg-sky-200" />

                <div>
                  <p className="text-xs font-semibold text-sky-700 mb-1.5 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Permissions:
                  </p>
                  <ul className="space-y-1">
                    {roleDetails[hoveredRole].permissions.map((perm, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-stratosphere-600">
                        <span className="text-sky-500 mt-0.5 flex-shrink-0">•</span>
                        <span>{perm}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator className="bg-sky-200" />

                <div className="bg-sky-50 rounded p-2 border border-sky-200">
                  <p className="text-xs text-stratosphere-700">
                    <span className="font-semibold text-sky-700">Scope:</span>{' '}
                    {roleDetails[hoveredRole].scope}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Organization Selection */}
      {showOrganizationField && (
        <div className="space-y-3 animate-in fade-in duration-300">
          <Label htmlFor="organization" className="text-stratosphere-900 font-semibold flex items-center gap-2">
            <Building className="h-4 w-4 text-primary-500" />
            Organization
          </Label>
          <Select value={organizationId} onValueChange={setOrganizationId}>
            <SelectTrigger 
              id="organization" 
              className="border-concrete-500 focus:border-primary-500 focus:ring-primary-500"
            >
              <SelectValue placeholder="Select an organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.length === 0 ? (
                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                  No organizations available
                </div>
              ) : (
                organizations.map(org => (
                  <SelectItem key={org._id} value={org._id}>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-sky-500" />
                      {org.name}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Projects Selection */}
      {showProjectsField && (
        <div className="space-y-3 animate-in fade-in duration-300">
          <Label className="text-stratosphere-900 font-semibold flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-primary-500" />
            Projects <span className="text-sm font-normal text-muted-foreground">(Optional)</span>
          </Label>
          {loading ? (
            <div className="flex items-center justify-center py-8 bg-stratosphere-50 rounded-lg border border-concrete-500">
              <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 bg-stratosphere-50 rounded-lg border border-concrete-500">
              <FolderOpen className="h-12 w-12 mx-auto text-sky-500 mb-2" />
              <p className="text-sm text-stratosphere-700">No projects found for this organization</p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto border border-concrete-500 rounded-lg bg-white">
              <div className="p-3 space-y-2">
                {projects.map(project => (
                  <div 
                    key={project._id} 
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-stratosphere-50 transition-colors border border-transparent hover:border-concrete-500"
                  >
                    <Checkbox 
                      id={`project-${project._id}`}
                      checked={selectedProjects.includes(project._id)}
                      onCheckedChange={() => handleProjectToggle(project._id)}
                      className="mt-1 border-concrete-500 data-[state=checked]:bg-primary-500 data-[state=checked]:border-primary-500"
                    />
                    <div className="grid gap-1 flex-1">
                      <Label 
                        htmlFor={`project-${project._id}`}
                        className="font-semibold text-stratosphere-900 cursor-pointer"
                      >
                        {project.name}
                      </Label>
                      {project.description && (
                        <p className="text-sm text-sky-500">{project.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {selectedProjects.length > 0 && (
            <p className="text-sm text-stratosphere-700">
              <span className="font-semibold">{selectedProjects.length}</span> project(s) selected
            </p>
          )}
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4">
        <Button 
          type="submit" 
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-6"
          disabled={shouldBeDisabled}
        >
          {submitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Assigning Role...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Assign Role
            </>
          )}
        </Button>
      </div>
    </form>
  );
}