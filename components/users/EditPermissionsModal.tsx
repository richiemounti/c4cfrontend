// components/users/EditPermissionsModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { Shield, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { updateUserPermissions } from '@/lib/api/user';
import { LoadingSpinner } from '@/components/auth/LoadingSpinner';
import { useAuthError } from '@/hooks/useAuthError';
import { User, IPermissions } from '@/types';

interface EditPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organizationId: string;
  targetUser: User;
}

const DEFAULT_PERMISSIONS: IPermissions = {
  submitData: false,
  useDataCollector: false,
  viewRiskRegister: false,
  generateReports: false,
  learnAndTell: false,
  inviteUsers: false,
};

const PERMISSION_OPTIONS: Array<{ key: keyof IPermissions; label: string; description: string }> = [
  { key: 'submitData', label: 'Submit Data', description: 'Can complete tasks and enter data in the field' },
  { key: 'useDataCollector', label: 'Data Collector App', description: 'Can use the mobile Data Collector app to capture responses' },
  { key: 'viewRiskRegister', label: 'Risk Register', description: 'Can view and access the project Risk Register' },
  { key: 'generateReports', label: 'Reports', description: 'Can generate and export project reports' },
  { key: 'learnAndTell', label: 'Learn & Tell', description: 'Can engage with the Learn & Tell learning module' },
  { key: 'inviteUsers', label: 'Invite Users', description: 'Can invite other users to join the organisation' },
];

export const EditPermissionsModal: React.FC<EditPermissionsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  organizationId,
  targetUser,
}) => {
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [permissions, setPermissions] = useState<IPermissions>(DEFAULT_PERMISSIONS);
  const [isLoading, setIsLoading] = useState(false);
  const { error, handleError, clearErrors } = useAuthError();

  useEffect(() => {
    if (!isOpen) return;

    const existingRole = targetUser.roles?.find(r => r.organization === organizationId);
    setIsOrgAdmin(existingRole?.isOrgAdmin ?? false);
    setPermissions({ ...DEFAULT_PERMISSIONS, ...(existingRole?.permissions ?? {}) });
    clearErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, targetUser, organizationId]);

  const handlePermissionToggle = (key: keyof IPermissions) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOrgAdminToggle = () => {
    setIsOrgAdmin(prev => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateUserPermissions(targetUser._id, {
        organizationId,
        isOrgAdmin,
        permissions,
      });
      onSuccess();
    } catch (err: any) {
      console.error('Update permissions error:', err);
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      clearErrors();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md flex flex-col max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-stratosphere-900">Edit Permissions</DialogTitle>
          <DialogDescription className="text-sky-500">
            Update what {targetUser.name || targetUser.email} can access in this organisation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organisation Admin */}
            <div className="flex items-start gap-3 rounded-md border border-primary-200 bg-primary-50 p-3">
              <Checkbox
                id="edit-isOrgAdmin"
                checked={isOrgAdmin}
                onCheckedChange={handleOrgAdminToggle}
                disabled={isLoading}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <Label htmlFor="edit-isOrgAdmin" className="text-sm font-semibold text-stratosphere-900 cursor-pointer leading-none flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  Organisation Admin
                </Label>
                <p className="text-xs text-primary-800 mt-1">
                  Full access to all organisation settings, users, projects, and billing — overrides the permissions below.
                </p>
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-3">
              <Label className="text-stratosphere-900 flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary-500" />
                Permissions
              </Label>
              <Card className="border border-concrete-300">
                <CardContent className="pt-4 pb-3">
                  <div className="space-y-3">
                    {PERMISSION_OPTIONS.map((perm) => (
                      <div key={perm.key} className="flex items-start gap-3">
                        <Checkbox
                          id={`edit-perm-${perm.key}`}
                          checked={isOrgAdmin ? true : permissions[perm.key]}
                          onCheckedChange={() => handlePermissionToggle(perm.key)}
                          disabled={isLoading || isOrgAdmin}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor={`edit-perm-${perm.key}`}
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

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
                {error}
              </div>
            )}

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
                {isLoading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
