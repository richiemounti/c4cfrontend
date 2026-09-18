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
      // ConnectGo Staff Roles — dark brand backgrounds, white text
      owner:          { backgroundColor: '#1a1814', color: '#ffffff' }, // ink
      admin:          { backgroundColor: '#00415a', color: '#ffffff' }, // petrol
      accountManager: { backgroundColor: '#2b48d8', color: '#ffffff' }, // cobalt
      analyst:        { backgroundColor: '#6c0e30', color: '#ffffff' }, // burgundy

      // Client Roles
      manager:        { backgroundColor: '#ff6b58', color: '#ffffff' }, // coral
      projectCreator: { backgroundColor: '#f7dc88', color: '#1a1814' }, // gold
      leadership:     { backgroundColor: '#b9cdc5', color: '#1a1814' }, // sage
      hq:             { backgroundColor: '#79d4dd', color: '#1a1814' }, // paleblue
      communications: { backgroundColor: '#ffb6b8', color: '#1a1814' }, // blossom
      fieldStaff:     { backgroundColor: '#80807f', color: '#ffffff' }, // neutral-600
      fieldAgent:     { backgroundColor: '#aeaeaf', color: '#1a1814' }, // neutral-400
    };
    return styles[roleName] ?? { backgroundColor: '#aeaeaf', color: '#1a1814' }; // neutral-400
  };

  if (roles.length === 0) {
    return (
      <div className="text-center py-12 bg-ink-50 rounded-lg border border-stone-500">
        <Shield className="h-12 w-12 mx-auto text-neutral-500 mb-3" />
        <p className="text-ink-700 font-medium">No roles assigned</p>
        <p className="text-sm text-muted-foreground mt-1">Assign a role using the form above</p>
      </div>
    );
  }

  return (
    <div className="border border-stone-500 rounded-lg overflow-hidden shadow-sm bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-ink-50 border-b border-stone-500 hover:bg-ink-50">
            <TableHead className="font-semibold text-ink-900">Role</TableHead>
            <TableHead className="font-semibold text-ink-900">Organization</TableHead>
            <TableHead className="font-semibold text-ink-900">Projects</TableHead>
            <TableHead className="text-right font-semibold text-ink-900">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => {
            const projectNames = getProjectNames(role);

            return (
              <TableRow
                key={role._id}
                className="border-b border-stone-100 hover:bg-ink-50/30 transition-colors"
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
                        style={{ backgroundColor: '#fefaed', color: '#807247', borderColor: '#fbeec4' }} // gold
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
                    <div className="flex items-center gap-2 text-ink-700">
                      <Building className="h-4 w-4 text-neutral-500" />
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
                      <div className="flex items-center gap-2 text-ink-700 mb-2">
                        <FileText className="h-4 w-4 text-neutral-500" />
                        <span className="font-medium text-sm">{projectNames.length} project(s)</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {projectNames.map((projectName: string, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
                            style={{ backgroundColor: '#ebf9fa', color: '#529096', borderColor: '#bceaee' }} // paleblue
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
                        className="border-sage-500 text-sage-700 hover:bg-sage-50 font-medium"
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
                          className="border-coral-500 text-coral-700 hover:bg-coral-50 font-medium"
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
                      <AlertDialogContent className="border-stone-500">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-ink-900 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-coral-500" />
                            Remove Role
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-ink-700">
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
                              <div className="mt-3 p-3 bg-coral-50 border border-coral-300 rounded-lg">
                                <p className="font-semibold text-coral-700 flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4" />
                                  Warning: Primary Role
                                </p>
                                <p className="text-sm text-ink-600 mt-1">
                                  Removing this role will automatically set another role as primary.
                                </p>
                              </div>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-stone-500">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveRole(role._id)}
                            className="bg-coral-500 text-white hover:bg-coral-600"
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