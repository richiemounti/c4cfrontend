// components/users/InviteUserModal.tsx - WITH PORTAL-BASED FLOATING HOVER CARDS
'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Mail, User, Shield, Briefcase, Users, MessageSquare, Clipboard, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { inviteUser } from '@/lib/api/user';
import { LoadingSpinner } from '@/components/auth/LoadingSpinner';
import { useAuthError } from '@/hooks/useAuthError';
import { validateEmail } from '@/utils/validation';
import { getOrganizationProjects } from '@/lib/api/project';
import { Project } from '@/types';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organizationId?: string;
}

type RoleType = 'projectCreator' | 'leadership' | 'hq' | 'communications' | 'fieldStaff' | 'fieldAgent';

const CLIENT_ROLES = [
  {
    value: 'projectCreator' as RoleType,
    label: 'Project Creator',
    description: 'Can create and configure projects',
    icon: <Briefcase className="h-4 w-4" />,
    detailedInfo: {
      fullDescription: 'Project setup and configuration lead',
      permissions: [
        'Create new projects',
        'Configure project settings',
        'Manage project parameters',
        'Export project-specific reports'
      ],
      scope: 'Assigned projects only'
    }
  },
  {
    value: 'leadership' as RoleType,
    label: 'Leadership',
    description: 'View outputs: dashboards, surveys, reports',
    icon: <Shield className="h-4 w-4" />,
    detailedInfo: {
      fullDescription: 'Executive/managerial role with output visibility',
      permissions: [
        'View visualized results and dashboards',
        'Access survey building tools',
        'Generate and view reports',
        'Review risk registers',
        'Access learning and reporting tools'
      ],
      scope: 'Assigned projects only'
    }
  },
  {
    value: 'hq' as RoleType,
    label: 'HQ',
    description: 'All leadership permissions plus review and approve',
    icon: <Users className="h-4 w-4" />,
    detailedInfo: {
      fullDescription: 'Headquarters staff with full visibility and approval authority',
      permissions: [
        'All leadership permissions',
        'Review field submissions',
        'Approve or reject submitted data',
        'Monitor data quality',
        'Oversee project progress'
      ],
      scope: 'Assigned projects only'
    }
  },
  {
    value: 'communications' as RoleType,
    label: 'Communications',
    description: 'View outputs: dashboards, surveys, reports',
    icon: <MessageSquare className="h-4 w-4" />,
    detailedInfo: {
      fullDescription: 'Communications and reporting specialist',
      permissions: [
        'View visualized results and dashboards',
        'Access survey building tools',
        'Generate and view reports',
        'Review risk registers',
        'Access learning and reporting tools'
      ],
      scope: 'Assigned projects only'
    }
  },
  {
    value: 'fieldStaff' as RoleType,
    label: 'Field Staff',
    description: 'Review submissions, stakeholder mapping, project setup',
    icon: <Clipboard className="h-4 w-4" />,
    detailedInfo: {
      fullDescription: 'Field operations coordinator with elevated permissions',
      permissions: [
        'Review field submissions',
        'Manage stakeholder mapping',
        'Configure project and site setup',
        'Work on theory of change',
        'Coordinate field activities'
      ],
      scope: 'Assigned projects only'
    }
  },
  {
    value: 'fieldAgent' as RoleType,
    label: 'Field Agent',
    description: 'View assignments and submit data',
    icon: <User className="h-4 w-4" />,
    detailedInfo: {
      fullDescription: 'Field data collector',
      permissions: [
        'View assigned tasks and surveys',
        'Submit field data and responses',
        'Access assignment details',
        'Basic field operations'
      ],
      scope: 'Assigned projects only'
    }
  }
];

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  organizationId
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [hoveredRole, setHoveredRole] = useState<RoleType | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ top: number; left: number } | null>(null);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const { error, handleError, clearErrors, getFieldError } = useAuthError();

  // Handle client-side mounting for Portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Fetch projects when modal opens
  useEffect(() => {
    if (isOpen && organizationId) {
      fetchProjects();
    }
  }, [isOpen, organizationId]);

  // Clear hover when select closes
  useEffect(() => {
    if (!isSelectOpen) {
      setHoveredRole(null);
      setHoverPosition(null);
    }
  }, [isSelectOpen]);

  const fetchProjects = async () => {
    if (!organizationId) {
      console.warn('Organization ID is required to fetch projects');
      return;
    }

    setLoadingProjects(true);
    try {
      const response = await getOrganizationProjects(organizationId, 1, 100);
      setProjects(response.data);
      console.log(`✅ Loaded ${response.count} projects for organization`);
    } catch (err: any) {
      console.error('Failed to fetch projects:', err);
      handleError({ message: 'Failed to load projects. Please try again.' });
    } finally {
      setLoadingProjects(false);
    }
  };

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
    
    // Calculate horizontal position - place to the right if there's space, otherwise to the left
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const cardWidth = 320; // 80 * 4 (w-80)
    const cardHeight = 350; // Approximate height of the card
    const spaceOnRight = windowWidth - rect.right;
    
    let left = rect.right + 10;
    if (spaceOnRight < cardWidth + 20) {
      // Not enough space on right, place on left
      left = rect.left - cardWidth - 10;
    }
    
    // Calculate vertical position - adjust if card would go off bottom of screen
    const spaceBelow = windowHeight - rect.top;
    let top = rect.top + window.scrollY - 20; // Start slightly above the item
    
    if (spaceBelow < cardHeight + 40) {
      // Not enough space below, align card bottom with viewport bottom
      top = Math.max(10, windowHeight - cardHeight - 20) + window.scrollY;
    }
    
    setHoverPosition({
      top: top,
      left: left
    });
  };

  const handleRoleLeave = () => {
    setHoveredRole(null);
    setHoverPosition(null);
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
    // Clear hover state when a role is selected
    setHoveredRole(null);
    setHoverPosition(null);
    setIsSelectOpen(false);
  };

  const validateForm = (): boolean => {
    clearErrors();

    const emailError = validateEmail(email);
    if (emailError) {
      handleError({ message: emailError });
      return false;
    }

    if (!role) {
      handleError({ message: 'Please select a role for the user' });
      return false;
    }

    if (!organizationId) {
      handleError({ message: 'Organization ID is required' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await inviteUser({
        email,
        role,
        organizationId: organizationId!,
        projectIds: selectedProjects.length > 0 ? selectedProjects : undefined
      });

      // Reset form
      setEmail('');
      setRole('');
      setSelectedProjects([]);
      clearErrors();

      onSuccess();
    } catch (err: any) {
      console.error('Invite user error:', err);
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmail('');
      setRole('');
      setSelectedProjects([]);
      clearErrors();
      onClose();
    }
  };

  const selectedRoleInfo = CLIENT_ROLES.find(r => r.value === role);

  // Floating Role Info Card Component
  const FloatingRoleCard = () => {
    if (!hoveredRole || !hoverPosition || !isSelectOpen || !mounted) return null;

    const roleInfo = CLIENT_ROLES.find(r => r.value === hoveredRole);
    if (!roleInfo) return null;

    return createPortal(
      <div
        className="fixed z-[9999] w-80"
        style={{
          top: `${hoverPosition.top}px`,
          left: `${hoverPosition.left}px`
        }}
      >
        <Card className="border-2 border-sky-300 bg-white shadow-2xl">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-sky-100 rounded">
                  <Briefcase className="h-4 w-4 text-sky-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-sm text-stratosphere-900">
                      {roleInfo.label}
                    </h4>
                    <Badge className="bg-sky-500 text-white text-xs">
                      Client
                    </Badge>
                  </div>
                  <p className="text-xs text-stratosphere-600">
                    {roleInfo.detailedInfo.fullDescription}
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
                  {roleInfo.detailedInfo.permissions.map((perm, idx) => (
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
                  {roleInfo.detailedInfo.scope}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>,
      document.body
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md flex flex-col max-h-[90vh] overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-stratosphere-900">Invite New User</DialogTitle>
            <DialogDescription className="text-sky-500">
              Send an invitation to join your organization. They'll receive an email with setup instructions.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-stratosphere-900">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-500 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              {getFieldError('email') && (
                <p className="text-sm text-red-600">{getFieldError('email')}</p>
              )}
            </div>

            {/* Role Selection with Hover Cards */}
            <div className="space-y-2" ref={selectRef}>
              <Label htmlFor="role" className="text-stratosphere-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary-500" />
                Role
                <span className="text-xs text-sky-500 font-normal">(Hover over roles for details)</span>
              </Label>
              <Select 
                value={role} 
                onValueChange={handleRoleChange}
                onOpenChange={setIsSelectOpen}
                disabled={isLoading}
              >
                <SelectTrigger 
                  id="role"
                  className="border-concrete-500 focus:border-primary-500 focus:ring-primary-500"
                >
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1.5 text-xs font-semibold text-stratosphere-900 flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-sky-500" />
                    Client Roles
                  </div>
                  {CLIENT_ROLES.map((roleOption) => (
                    <SelectItem 
                      key={roleOption.value} 
                      value={roleOption.value}
                      className="pl-6"
                      onMouseEnter={(e) => handleRoleHover(roleOption.value, e)}
                      onMouseLeave={handleRoleLeave}
                    >
                      <div className="flex items-center gap-2">
                        {roleOption.icon}
                        <span>{roleOption.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {getFieldError('role') && (
                <p className="text-sm text-red-600">{getFieldError('role')}</p>
              )}
            </div>
              
            {/* Selected Role Summary */}
            {selectedRoleInfo && (
              <div className="bg-sky-50 border border-sky-200 rounded-md p-3 animate-in fade-in duration-300">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">{selectedRoleInfo.icon}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-stratosphere-900">
                      {selectedRoleInfo.label}
                    </p>
                    <p className="text-xs text-sky-600 mt-1">
                      {selectedRoleInfo.detailedInfo.fullDescription}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Project Selection */}
            <div className="space-y-2">
              <Label className="text-stratosphere-900">Projects (Optional)</Label>
              <p className="text-sm text-sky-500 mb-3">
                Select specific projects this user will have access to. Leave empty for organization-wide access.
              </p>
              
              {loadingProjects ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-4">
                    {projects.length === 0 ? (
                      <p className="text-sm text-concrete-500 text-center py-2">
                        No projects available
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-40 overflow-y-auto">
                        {projects.map((project) => (
                          <div key={project._id} className="flex items-start space-x-2">
                            <Checkbox
                              id={project._id}
                              checked={selectedProjects.includes(project._id)}
                              onCheckedChange={() => handleProjectToggle(project._id)}
                              disabled={isLoading}
                            />
                            <div className="flex-1 min-w-0">
                              <Label
                                htmlFor={project._id}
                                className="text-sm font-medium text-stratosphere-900 cursor-pointer"
                              >
                                {project.name}
                              </Label>
                              {project.description && (
                                <p className="text-xs text-sky-500 mt-1 truncate">
                                  {project.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Selected Projects Count */}
            {selectedProjects.length > 0 && (
              <div className="bg-grass-50 border border-grass-500/20 rounded-md p-3">
                <p className="text-sm text-grass-900">
                  ✓ {selectedProjects.length} project{selectedProjects.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-ochre-500 hover:bg-ochre-600 text-white"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Portal-rendered Floating Card */}
      <FloatingRoleCard />
    </>
  );
};