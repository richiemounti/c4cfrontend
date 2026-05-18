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
import { getOrganizationUsers, revokeInvitation, resendInvitation } from '@/lib/api/user';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/auth/LoadingSpinner';
import { User } from '@/types';

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
  const itemsPerPage = 10;

  // Use provided organizationId or fall back to user's first organization
  const activeOrganizationId = organizationId || currentUser?.roles?.[0]?.organization;

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

  const getStatusBadge = (user: User) => {
    if (user.isTemporaryUser && !user.invitationAccepted) {
      const isExpired = user.invitationExpires && new Date(user.invitationExpires) < new Date();
      return (
        <Badge variant={isExpired ? "destructive" : "secondary"} className="bg-ochre-100 text-ochre-800">
          <Clock className="w-3 h-3 mr-1" />
          {isExpired ? 'Expired' : 'Pending'}
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-forest-100 text-forest-800">
        <UserCheck className="w-3 h-3 mr-1" />
        Active
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      // Client Roles
      manager: 'bg-primary-100 text-primary-800',
      projectCreator: 'bg-sky-100 text-sky-800',
      leadership: 'bg-forest-100 text-forest-800',
      hq: 'bg-ochre-100 text-ochre-800',
      communications: 'bg-grass-100 text-grass-800',
      fieldStaff: 'bg-clay-100 text-clay-800',
      fieldAgent: 'bg-concrete-100 text-concrete-800',
      
      // ConnectGo Staff Roles (in case they appear)
      analyst: 'bg-sky-100 text-sky-800',
      admin: 'bg-forest-100 text-forest-800',
      owner: 'bg-ochre-100 text-ochre-800',
      accountManager: 'bg-grass-100 text-grass-800'
    };

    return (
      <Badge className={roleColors[role] || 'bg-concrete-100 text-concrete-800'}>
        {role.replace(/([A-Z])/g, ' $1').trim()}
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
              <h1 className="text-3xl font-bold text-stratosphere-900">Users & Permissions</h1>
              <p className="text-sky-500 mt-1">Manage your organization's users and invitations</p>
            </div>
            
            <Button 
              onClick={() => setShowInviteModal(true)}
              className="bg-ochre-500 hover:bg-ochre-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-white border border-concrete-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-sky-500">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-stratosphere-900">{users.length}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border border-concrete-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-sky-500">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-forest-600">
                  {users.filter(u => !u.isTemporaryUser).length}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border border-concrete-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-sky-500">Pending Invitations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-ochre-600">
                  {users.filter(u => u.isTemporaryUser && !u.invitationAccepted).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="bg-white border border-concrete-500">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-500 w-4 h-4" />
                  <Input
                    placeholder="Search users by name, email, or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-concrete-500 focus:border-ochre-500 focus:ring-ochre-500"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40 border-concrete-500">
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
                  <SelectTrigger className="w-full sm:w-48 border-concrete-500">
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
            <Card className="bg-white border border-concrete-500">
              <CardContent className="pt-6">
                <div className="text-center text-red-600">{error}</div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white border border-concrete-500">
              <Table>
                <TableHeader>
                  <TableRow className="border-concrete-500">
                    <TableHead className="text-stratosphere-900">User</TableHead>
                    <TableHead className="text-stratosphere-900">Role</TableHead>
                    <TableHead className="text-stratosphere-900">Status</TableHead>
                    <TableHead className="text-stratosphere-900">Invited By</TableHead>
                    <TableHead className="text-stratosphere-900">Joined</TableHead>
                    <TableHead className="w-20 text-stratosphere-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user._id} className="border-concrete-500 hover:bg-sky-50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-stratosphere-900">{user.name}</div>
                          <div className="text-sm text-sky-500">{user.email}</div>
                          <div className="text-xs text-concrete-500">@{user.userName}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getRoleBadge(user.primaryRole)}
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(user)}
                      </TableCell>
                      
                      <TableCell>
                        {user.invitedBy ? (
                          <div className="text-sm">
                            <div className="text-stratosphere-900">{user.invitedBy.name}</div>
                            <div className="text-xs text-sky-500">{user.invitedBy.email}</div>
                          </div>
                        ) : (
                          <span className="text-concrete-500">-</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm text-sky-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-sky-50">
                              <MoreHorizontal className="h-4 w-4 text-sky-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border border-concrete-500">
                            {user.isTemporaryUser && !user.invitationAccepted ? (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleResendInvitation(user._id)}
                                  className="text-ochre-600 hover:bg-ochre-50"
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  Resend Invitation
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleRevokeInvitation(user._id)}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Revoke Invitation
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem disabled className="text-concrete-500">
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
                <div className="text-center py-8 text-sky-500">
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
                className="border-concrete-500 text-stratosphere-900 hover:bg-sky-50"
              >
                Previous
              </Button>
              
              <span className="text-sm text-sky-500">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="border-concrete-500 text-stratosphere-900 hover:bg-sky-50"
              >
                Next
              </Button>
            </div>
          )}

          {/* Invite User Modal */}
          {showInviteModal && (
            <InviteUserModal
              isOpen={showInviteModal}
              onClose={() => setShowInviteModal(false)}
              onSuccess={handleInviteSuccess}
              organizationId={activeOrganizationId}
            />
          )}
        </div>
      </div>
  );
};