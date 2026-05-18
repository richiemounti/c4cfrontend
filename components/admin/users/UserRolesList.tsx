'use client';

import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  BadgeCheck, 
  Building, 
  Check, 
  FileText, 
  Trash2, 
  Shield,
  AlertTriangle 
} from 'lucide-react';
import { removeRole, setPrimaryRole } from '@/lib/api/user';
import { Role } from '@/types';

interface UserRolesListProps {
  userId: string;
  roles: Role[];
  primaryRole: string | undefined;
  onRoleRemoved: () => void;
  onPrimaryRoleChanged: () => void;
}

export default function UserRolesList({ 
  userId, 
  roles,
  primaryRole,
  onRoleRemoved,
  onPrimaryRoleChanged 
}: UserRolesListProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSetPrimaryRole = async (roleId: string) => {
    try {
      setLoading(`primary_${roleId}`);
      const response = await setPrimaryRole(userId, roleId);
      if (!response) throw new Error('Failed to set primary role');
      toast({ title: "Success", description: "Primary role updated successfully" });
      onPrimaryRoleChanged();
    } catch (error) {
      console.error("Error setting primary role:", error);
      toast({ title: "Error", description: "Failed to set primary role", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      setLoading(`remove_${roleId}`);
      const response = await removeRole(userId, roleId);
      if (!response) throw new Error('Failed to remove role');
      toast({ title: "Success", description: "Role removed successfully" });
      onRoleRemoved();
    } catch (error) {
      console.error("Error removing role:", error);
      toast({ title: "Error", description: "Failed to remove role", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const getOrganizationName = (role: any) => {
    if (!role.organization) return 'N/A';
    return typeof role.organization === 'object' ? role.organization.name : 'Loading...';
  };

  const getProjectNames = (role: any): string[] => {
    if (!role.projects || role.projects.length === 0) return [];
    return role.projects
      .map((project: any) => (typeof project === 'object' && project.name ? project.name : null))
      .filter(Boolean);
  };

  const isConnectGoRole = (roleName: string) => {
    return ['owner', 'admin', 'accountManager', 'analyst'].includes(roleName);
  };

  /**
   * Returns inline style objects instead of relying on custom Tailwind color classes.
   * This avoids the shadcn Badge default variant injecting conflicting white text
   * on top of custom bg classes that may render as near-white.
   */
  const getRoleStyle = (roleName: string): React.CSSProperties => {
    const styles: Record<string, React.CSSProperties> = {
      // ConnectGo Staff Roles — dark backgrounds, white text
      owner:          { backgroundColor: '#c47d1e', color: '#ffffff' }, // ochre-500
      admin:          { backgroundColor: '#1a5c3a', color: '#ffffff' }, // forest-500
      accountManager: { backgroundColor: '#4a9c3f', color: '#ffffff' }, // grass-500
      analyst:        { backgroundColor: '#0284c7', color: '#ffffff' }, // sky-600

      // Client Roles
      manager:        { backgroundColor: '#2563eb', color: '#ffffff' }, // primary-500 (blue)
      projectCreator: { backgroundColor: '#0ea5e9', color: '#ffffff' }, // sky-500
      leadership:     { backgroundColor: '#166534', color: '#ffffff' }, // forest-600
      hq:             { backgroundColor: '#b45309', color: '#ffffff' }, // ochre-600
      communications: { backgroundColor: '#16a34a', color: '#ffffff' }, // grass-600
      fieldStaff:     { backgroundColor: '#a16207', color: '#ffffff' }, // clay-500 approx
      fieldAgent:     { backgroundColor: '#6b7280', color: '#ffffff' }, // concrete-500 with white text
    };
    return styles[roleName] ?? { backgroundColor: '#6b7280', color: '#ffffff' };
  };

  if (roles.length === 0) {
    return (
      <div className="text-center py-12 bg-stratosphere-50 rounded-lg border border-concrete-500">
        <Shield className="h-12 w-12 mx-auto text-sky-500 mb-3" />
        <p className="text-stratosphere-700 font-medium">No roles assigned</p>
        <p className="text-sm text-muted-foreground mt-1">Assign a role using the form above</p>
      </div>
    );
  }

  return (
    <div className="border border-concrete-500 rounded-lg overflow-hidden shadow-sm bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-stratosphere-50 border-b border-concrete-500 hover:bg-stratosphere-50">
            <TableHead className="font-semibold text-stratosphere-900">Role</TableHead>
            <TableHead className="font-semibold text-stratosphere-900">Organization</TableHead>
            <TableHead className="font-semibold text-stratosphere-900">Projects</TableHead>
            <TableHead className="text-right font-semibold text-stratosphere-900">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => {
            const projectNames = getProjectNames(role);

            return (
              <TableRow
                key={role._id}
                className="border-b border-concrete-100 hover:bg-stratosphere-50/30 transition-colors"
              >
                {/* Role column */}
                <TableCell>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Role name badge — uses inline styles to guarantee contrast */}
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                      style={getRoleStyle(role.role)}
                    >
                      {role.role.replace(/([A-Z])/g, ' $1').trim()}
                    </span>

                    {/* Primary badge */}
                    {role.role === primaryRole && (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border"
                        style={{ backgroundColor: '#dcfce7', color: '#15803d', borderColor: '#86efac' }}
                      >
                        <BadgeCheck className="h-3 w-3" />
                        Primary
                      </span>
                    )}

                    {/* ConnectGo Staff badge */}
                    {isConnectGoRole(role.role) && (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border"
                        style={{ backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fcd34d' }}
                      >
                        <Shield className="h-3 w-3" />
                        Staff
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Organization column */}
                <TableCell>
                  {role.organization ? (
                    <div className="flex items-center gap-2 text-stratosphere-700">
                      <Building className="h-4 w-4 text-sky-500" />
                      <span className="font-medium">{getOrganizationName(role)}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </TableCell>

                {/* Projects column */}
                <TableCell>
                  {projectNames.length > 0 ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-stratosphere-700 mb-2">
                        <FileText className="h-4 w-4 text-sky-500" />
                        <span className="font-medium text-sm">{projectNames.length} project(s)</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {projectNames.map((projectName: string, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
                            style={{ backgroundColor: '#f0f9ff', color: '#0369a1', borderColor: '#7dd3fc' }}
                          >
                            {projectName}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </TableCell>

                {/* Actions column */}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {role.role !== primaryRole && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetPrimaryRole(role._id)}
                        disabled={loading === `primary_${role._id}`}
                        className="border-grass-500 text-grass-700 hover:bg-grass-50 font-medium"
                      >
                        {loading === `primary_${role._id}` ? (
                          <span className="animate-spin">⏳</span>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Set Primary
                          </>
                        )}
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={loading === `remove_${role._id}`}
                          className="border-sand-500 text-sand-700 hover:bg-sand-50 font-medium"
                        >
                          {loading === `remove_${role._id}` ? (
                            <span className="animate-spin">⏳</span>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border-concrete-500">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-stratosphere-900 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-sand-500" />
                            Remove Role
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-stratosphere-700">
                            Are you sure you want to remove the{' '}
                            <span className="font-semibold">&quot;{role.role}&quot;</span> role
                            {role.organization ? ` for ${getOrganizationName(role)}` : ''}?
                            {projectNames.length > 0 && (
                              <div className="mt-2 text-sm">
                                This will remove access to:{' '}
                                <span className="font-semibold">{projectNames.join(', ')}</span>
                              </div>
                            )}
                            {role.role === primaryRole && (
                              <div className="mt-3 p-3 bg-sand-50 border border-sand-300 rounded-lg">
                                <p className="font-semibold text-sand-700 flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4" />
                                  Warning: Primary Role
                                </p>
                                <p className="text-sm text-stratosphere-600 mt-1">
                                  Removing this role will automatically set another role as primary.
                                </p>
                              </div>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-concrete-500">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveRole(role._id)}
                            className="bg-sand-500 text-white hover:bg-sand-600"
                          >
                            Remove Role
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}