// app/dashboard/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  UserCheck, 
  UserX,
  Clock,
  Users as UsersIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InviteUserModal } from '@/components/users/InviteUserModal';
import { EditPermissionsModal } from '@/components/users/EditPermissionsModal';
import { getOrganizationUsers, revokeInvitation, resendInvitation, archiveUser } from '@/lib/api/user';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/auth/LoadingSpinner';
import { User } from '@/types';
import { isOrgAdmin } from '@/utils/permissions';

const PERMISSION_FLAG_LABELS: Record<string, string> = {
  submitData: 'Submit Data',
  useDataCollector: 'Data Collector',
  viewRiskRegister: 'Risk Register',
  generateReports: 'Reports',
  learnAndTell: 'Learn & Tell',
  inviteUsers: 'Invite Users',
};

interface PageProps {
  params: {
    id: string;
  };
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
}


export default function UsersPage({ params }: PageProps)  {
  const organizationId = params.id;

  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const itemsPerPage = 10;

  // Use provided organizationId or fall back to user's first organization
  const activeOrganizationId = organizationId || currentUser?.roles?.[0]?.organization;
  const canManage = isOrgAdmin(currentUser, activeOrganizationId);

  useEffect(() => {
    fetchUsers();
  }, [activeOrganizationId]);

  const fetchUsers = async () => {
    if (!activeOrganizationId) {
      setError('No organization found for current user');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getOrganizationUsers(activeOrganizationId);
      setUsers((response.data as User[]) || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSuccess = () => {
    setShowInviteModal(false);
    fetchUsers(); // Refresh the list
  };

  const handleRevokeInvitation = async (userId: string) => {
    try {
      await revokeInvitation(userId);
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      console.error('Failed to revoke invitation:', err);
    }
  };

  const handleResendInvitation = async (userId: string) => {
    try {
      await resendInvitation(userId);
      // Could show a success toast here
    } catch (err: any) {
      console.error('Failed to resend invitation:', err);
    }
  };

  const handleArchiveUser = async (userId: string) => {
    try {
      await archiveUser(userId);
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      console.error('Failed to archive user:', err);
    }
  };

  const handleEditPermissionsSuccess = () => {
    setEditingUser(null);
    fetchUsers(); // Refresh the list
  };

  const getPermissionPills = (user: User) => {
    const role = user.roles?.find(r => r.organization === activeOrganizationId);

    if (!role) return <span className="text-c4c-petrol text-xs">-</span>;

    if (role.isOrgAdmin) {
      return (
        <Badge className="bg-c4c-tint-cyan text-black">Org Admin</Badge>
      );
    }

    // Only consider known permission flags — the backend's permissions subdocument
    // can carry stray fields like _id/__v, which would otherwise render as bogus pills.
    const activeFlags = Object.entries(role.permissions ?? {}).filter(
      ([key, value]) => value === true && key in PERMISSION_FLAG_LABELS
    );

    if (activeFlags.length === 0) {
      return <span className="text-c4c-petrol text-xs">No permissions</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {activeFlags.map(([key]) => (
          <Badge key={key} variant="secondary" className="bg-c4c-rule text-c4c-petrol text-xs">
            {PERMISSION_FLAG_LABELS[key] || key}
          </Badge>
        ))}
      </div>
    );
  };

  const getStatusBadge = (user: User) => {
    if (user.isTemporaryUser && !user.invitationAccepted) {
      const isExpired = user.invitationExpires && new Date(user.invitationExpires) < new Date();
      return (
        <Badge variant={isExpired ? "destructive" : "secondary"} className="bg-c4c-tint-gold text-black">
          <Clock className="w-3 h-3 mr-1" />
          {isExpired ? 'Expired' : 'Pending'}
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-c4c-tint-sage text-black">
        <UserCheck className="w-3 h-3 mr-1" />
        Active
      </Badge>
    );
  };

  // Filter and search users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.userName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && !user.isTemporaryUser) ||
      (statusFilter === 'pending' && user.isTemporaryUser && !user.invitationAccepted) ||
      (statusFilter === 'expired' && user.isTemporaryUser && user.invitationExpires && new Date(user.invitationExpires) < new Date());
    
    const matchesRole = roleFilter === 'all' || user.primaryRole === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-hidden">
        <div className="container mx-auto py-6 space-y-6 bg-white min-h-screen">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black">Users & Permissions</h1>
              <p className="text-c4c-petrol mt-1">Manage your organization's users and invitations</p>
            </div>

            {canManage && (
              <Button
                onClick={() => setShowInviteModal(true)}
                className="bg-c4c-coral hover:bg-c4c-petrol text-black hover:text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Invite User
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-white border border-c4c-rule">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-c4c-petrol">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black">{users.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-c4c-rule">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-c4c-petrol">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-c4c-petrol">
                  {users.filter(u => !u.isTemporaryUser).length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-c4c-rule">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-c4c-petrol">Pending Invitations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-c4c-petrol">
                  {users.filter(u => u.isTemporaryUser && !u.invitationAccepted).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="bg-white border border-c4c-rule">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-c4c-petrol w-4 h-4" />
                  <Input
                    placeholder="Search users by name, email, or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-c4c-rule focus:border-c4c-yellow focus:ring-c4c-yellow"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40 border-c4c-rule">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-48 border-c4c-rule">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="projectCreator">Project Creator</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="hq">HQ</SelectItem>
                    <SelectItem value="communications">Communications</SelectItem>
                    <SelectItem value="fieldStaff">Field Staff</SelectItem>
                    <SelectItem value="fieldAgent">Field Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          {error ? (
            <Card className="bg-white border border-c4c-rule">
              <CardContent className="pt-6">
                <div className="text-center text-c4c-burgundy">{error}</div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white border border-c4c-rule">
              <Table>
                <TableHeader>
                  <TableRow className="border-c4c-rule">
                    <TableHead className="text-black">User</TableHead>
                    <TableHead className="text-black">Permissions</TableHead>
                    <TableHead className="text-black">Status</TableHead>
                    <TableHead className="text-black">Invited By</TableHead>
                    <TableHead className="text-black">Joined</TableHead>
                    <TableHead className="w-20 text-black">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user._id} className="border-c4c-rule hover:bg-c4c-grey-bg">
                      <TableCell>
                        <div>
                          <div className="font-medium text-black">{user.name}</div>
                          <div className="text-sm text-c4c-petrol">{user.email}</div>
                          <div className="text-xs text-c4c-petrol">@{user.userName}</div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {getPermissionPills(user)}
                      </TableCell>

                      <TableCell>
                        {getStatusBadge(user)}
                      </TableCell>

                      <TableCell>
                        {user.invitedBy ? (
                          <div className="text-sm">
                            <div className="text-black">{user.invitedBy.name}</div>
                            <div className="text-xs text-c4c-petrol">{user.invitedBy.email}</div>
                          </div>
                        ) : (
                          <span className="text-c4c-petrol">-</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="text-sm text-c4c-petrol">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-c4c-grey-bg">
                              <MoreHorizontal className="h-4 w-4 text-c4c-petrol" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border border-c4c-rule">
                            {user.isTemporaryUser && !user.invitationAccepted ? (
                              canManage ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleResendInvitation(user._id)}
                                    className="text-c4c-petrol hover:bg-c4c-tint-gold"
                                  >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Resend Invitation
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleRevokeInvitation(user._id)}
                                    className="text-c4c-burgundy hover:bg-c4c-tint-coral"
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Revoke Invitation
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <DropdownMenuItem disabled className="text-c4c-petrol">
                                  No actions available
                                </DropdownMenuItem>
                              )
                            ) : canManage && user._id !== currentUser?._id ? (
                              <>
                                <DropdownMenuItem onClick={() => setEditingUser(user)}>
                                  <UsersIcon className="h-4 w-4 mr-2" />
                                  Edit Permissions
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleArchiveUser(user._id)}
                                  className="text-c4c-burgundy hover:bg-c4c-tint-coral"
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Archive User
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem disabled className="text-c4c-petrol">
                                <UsersIcon className="h-4 w-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {paginatedUsers.length === 0 && (
                <div className="text-center py-8 text-c4c-petrol">
                  {filteredUsers.length === 0 ? 'No users match your filters' : 'No users found'}
                </div>
              )}
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-c4c-rule text-black hover:bg-c4c-grey-bg"
              >
                Previous
              </Button>

              <span className="text-sm text-c4c-petrol">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="border-c4c-rule text-black hover:bg-c4c-grey-bg"
              >
                Next
              </Button>
            </div>
          )}

          {/* Invite User Modal */}
          {showInviteModal && canManage && (
            <InviteUserModal
              isOpen={showInviteModal}
              onClose={() => setShowInviteModal(false)}
              onSuccess={handleInviteSuccess}
              organizationId={activeOrganizationId}
            />
          )}

          {/* Edit Permissions Modal */}
          {editingUser && canManage && (
            <EditPermissionsModal
              isOpen={!!editingUser}
              onClose={() => setEditingUser(null)}
              onSuccess={handleEditPermissionsSuccess}
              organizationId={activeOrganizationId!}
              targetUser={editingUser}
            />
          )}
        </div>
      </div>
  );
};