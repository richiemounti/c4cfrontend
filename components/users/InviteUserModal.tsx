// components/users/InviteUserModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Mail, Lock } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { inviteUser } from '@/lib/api/user';
import { LoadingSpinner } from '@/components/auth/LoadingSpinner';
import { useAuthError } from '@/hooks/useAuthError';
import { validateEmail } from '@/utils/validation';
import { getOrganizationProjects } from '@/lib/api/project';
import { Project, IPermissions } from '@/types';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organizationId?: string;
}

type RoleType = 'projectCreator' | 'leadership' | 'hq' | 'communications' | 'fieldStaff' | 'fieldAgent';

const DEFAULT_PERMISSIONS: IPermissions = {
  submitData: false,
  useDataCollector: false,
  viewRiskRegister: false,
  generateReports: false,
  learnAndTell: false,
  inviteUsers: false,
};

const ALL_PERMISSIONS_GRANTED: IPermissions = {
  submitData: true,
  useDataCollector: true,
  viewRiskRegister: true,
  generateReports: true,
  learnAndTell: true,
  inviteUsers: true,
};

const PERMISSION_OPTIONS: Array<{ key: keyof IPermissions; label: string; description: string }> = [
  {
    key: 'submitData',
    label: 'Submit Data',
    description: 'Can complete tasks and enter data in the field',
  },
  {
    key: 'useDataCollector',
    label: 'Data Collector App',
    description: 'Can use the mobile Data Collector app to capture responses',
  },
  {
    key: 'viewRiskRegister',
    label: 'Risk Register',
    description: 'Can view and access the project Risk Register',
  },
  {
    key: 'generateReports',
    label: 'Reports',
    description: 'Can generate and export project reports',
  },
  {
    key: 'learnAndTell',
    label: 'Learn & Tell',
    description: 'Can engage with the Learn & Tell learning module',
  },
  {
    key: 'inviteUsers',
    label: 'Invite Users',
    description: 'Can invite other users to join the organisation',
  },
];

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  organizationId
}) => {
  const [email, setEmail] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [permissions, setPermissions] = useState<IPermissions>(DEFAULT_PERMISSIONS);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const { error, handleError, clearErrors, getFieldError } = useAuthError();

  // Fetch projects when modal opens
  useEffect(() => {
    if (isOpen && organizationId) {
      fetchProjects();
    }
  }, [isOpen, organizationId]);

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

  const handlePermissionToggle = (key: keyof IPermissions) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOrgAdminToggle = () => {
    setIsOrgAdmin(prev => !prev);
  };

  // The backend still stores a legacy `role` string alongside the boolean
  // permission system, so one always has to be sent — but the user never
  // picks it directly. Infer the closest-matching legacy role from the
  // booleans they set, with a safe fallback so this can never block submission.
  const deriveRoleName = (): RoleType => {
    if (isOrgAdmin) return 'leadership';
    if (permissions.inviteUsers && permissions.viewRiskRegister && permissions.generateReports) return 'hq';
    if (permissions.viewRiskRegister && permissions.generateReports && permissions.learnAndTell) return 'leadership';
    if (permissions.generateReports && permissions.learnAndTell) return 'communications';
    if (permissions.submitData && permissions.viewRiskRegister) return 'fieldStaff';
    if (permissions.submitData && permissions.useDataCollector) return 'fieldAgent';
    if (permissions.submitData) return 'fieldAgent';
    return 'fieldAgent';
  };

  const validateForm = (): boolean => {
    clearErrors();

    const emailError = validateEmail(email);
    if (emailError) {
      handleError({ message: emailError });
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
        role: deriveRoleName(),
        organizationId: organizationId!,
        projectIds: selectedProjects.length > 0 ? selectedProjects : undefined,
        isOrgAdmin,
        permissions: isOrgAdmin ? ALL_PERMISSIONS_GRANTED : permissions,
      });

      // Reset form
      setEmail('');
      setSelectedProjects([]);
      setIsOrgAdmin(false);
      setPermissions(DEFAULT_PERMISSIONS);
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
      setSelectedProjects([]);
      setIsOrgAdmin(false);
      setPermissions(DEFAULT_PERMISSIONS);
      clearErrors();
      onClose();
    }
  };

  return (
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

          {/* Organisation Admin */}
          <div className="space-y-2">
            <div className="flex items-start gap-3 rounded-md border border-primary-200 bg-primary-50 p-3">
              <Checkbox
                id="isOrgAdmin"
                checked={isOrgAdmin}
                onCheckedChange={handleOrgAdminToggle}
                disabled={isLoading}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <Label htmlFor="isOrgAdmin" className="text-sm font-semibold text-stratosphere-900 cursor-pointer leading-none">
                  Organisation Admin
                </Label>
                <p className="text-xs text-primary-800 mt-1">
                  Full access to all organisation settings, users, projects, and billing — overrides the permissions below.
                </p>
              </div>
            </div>
          </div>

          {/* Additional Permissions */}
          <div className="space-y-3">
            <div>
              <Label className="text-stratosphere-900 flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary-500" />
                Permissions
              </Label>
              <p className="text-xs text-sky-500 mt-1">
                Tick whatever this person needs access to.
              </p>
            </div>
            <Card className="border border-concrete-300">
              <CardContent className="pt-4 pb-3">
                <div className="space-y-3">
                  {PERMISSION_OPTIONS.map((perm) => (
                    <div key={perm.key} className="flex items-start gap-3">
                      <Checkbox
                        id={`perm-${perm.key}`}
                        checked={isOrgAdmin ? true : permissions[perm.key]}
                        onCheckedChange={() => handlePermissionToggle(perm.key)}
                        disabled={isLoading || isOrgAdmin}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={`perm-${perm.key}`}
                          className="text-sm font-medium text-stratosphere-900 cursor-pointer leading-none"
                        >
                          {perm.label}
                        </Label>
                        <p className="text-xs text-sky-500 mt-0.5">{perm.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

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
  );
};
