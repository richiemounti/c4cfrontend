// app/admin/users/roles/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
import UserTable from '@/components/admin/users/UserTable';
import RoleAssignmentForm from '@/components/admin/users/RoleAssignmentForm';
import UserRolesList from '@/components/admin/users/UserRolesList';
import { getUserRoles, getUsers, archiveUser } from '@/lib/api/user';
import { getOrganizations } from '@/lib/api/organization';
import { Organization, User } from '@/types';
import { 
  Search, 
  UserCog, 
  Shield, 
  Building, 
  Mail, 
  Calendar,
  Archive,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';

export default function UserRolesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('all-users');
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const usersResponse = await getUsers(1, 100);
        setUsers(usersResponse.data);
        
        const orgsResponse = await getOrganizations(1, 100);
        setOrganizations(orgsResponse.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load users and organizations",
          variant: "destructive",
        });
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleUserSelect = async (user: User) => {
    try {
      setSelectedUser(null);
      setLoading(true);
      
      const rolesResponse = await getUserRoles(user._id);
      
      setSelectedUser({
        ...user,
        roles: rolesResponse.data.roles,
        primaryRole: rolesResponse.data.primaryRole,
        isConnectGoStaff: rolesResponse.data.isConnectGoStaff
      });
      
      setActiveTab('user-details');
    } catch (error) {
      console.error("Error fetching user roles:", error);
      toast({
        title: "Error",
        description: "Failed to load user roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveUser = async () => {
    if (!selectedUser) return;
    
    try {
      setArchiving(true);
      await archiveUser(selectedUser._id);
      
      // Remove user from list
      setUsers(users.filter(u => u._id !== selectedUser._id));
      
      toast({
        title: "Success",
        description: `${selectedUser.name} has been archived`,
      });
      
      // Reset selection and go back to users list
      setSelectedUser(null);
      setActiveTab('all-users');
    } catch (error) {
      console.error("Error archiving user:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to archive user",
        variant: "destructive",
      });
    } finally {
      setArchiving(false);
    }
  };

  const handleRoleAssigned = async () => {
    if (selectedUser) {
      await handleUserSelect(selectedUser);
      
      toast({
        title: "Success",
        description: "Role assigned successfully",
        variant: "default",
      });
    }
  };

  const handleRoleRemoved = async () => {
    if (selectedUser) {
      await handleUserSelect(selectedUser);
      
      toast({
        title: "Success",
        description: "Role removed successfully",
        variant: "default",
      });
    }
  };

  const handlePrimaryRoleChanged = async () => {
    if (selectedUser) {
      await handleUserSelect(selectedUser);
      
      toast({
        title: "Success",
        description: "Primary role updated successfully",
        variant: "default",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-stratosphere-500 rounded-lg">
            <UserCog className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-stratosphere-900">User Role Management</h1>
            <p className="text-sky-500 mt-1">Manage user access and permissions across the platform</p>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-stratosphere-50 p-1 border border-concrete-500">
          <TabsTrigger 
            value="all-users" 
            className="data-[state=active]:bg-primary-500 data-[state=active]:text-white"
          >
            <Shield className="h-4 w-4 mr-2" />
            All Users
          </TabsTrigger>
          <TabsTrigger 
            value="user-details" 
            disabled={!selectedUser}
            className="data-[state=active]:bg-primary-500 data-[state=active]:text-white"
          >
            <UserCog className="h-4 w-4 mr-2" />
            {selectedUser ? `${selectedUser.name}` : 'User Details'}
          </TabsTrigger>
        </TabsList>
        
        {/* All Users Tab */}
        <TabsContent value="all-users">
          <Card className="border-concrete-500 shadow-md">
            <CardHeader className="bg-gradient-to-r from-stratosphere-50 to-sky-50 border-b border-concrete-500">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-stratosphere-900 text-xl flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary-500" />
                    Platform Users
                  </CardTitle>
                  <CardDescription className="mt-1.5">
                    Select a user to manage their roles and permissions
                  </CardDescription>
                </div>
                <Badge className="bg-primary-500 text-white">
                  {filteredUsers.length} {filteredUsers.length === 1 ? 'User' : 'Users'}
                </Badge>
              </div>
              <div className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sky-500" />
                  <Input
                    placeholder="Search by name, email or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-concrete-500 focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-sky-500">Loading users...</p>
                  </div>
                </div>
              ) : (
                <UserTable 
                  users={filteredUsers} 
                  onUserSelect={handleUserSelect} 
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* User Details Tab */}
        <TabsContent value="user-details">
          {selectedUser && (
            <div className="space-y-6">
              {/* Back Button */}
              <Button
                variant="outline"
                onClick={() => setActiveTab('all-users')}
                className="border-concrete-500 text-stratosphere-700 hover:bg-stratosphere-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Users
              </Button>

              {/* User Info Card */}
              <Card className="border-concrete-500 shadow-md bg-white">
                <CardHeader className="bg-gradient-to-r from-stratosphere-50 to-sky-50 border-b border-concrete-500">
                  <CardTitle className="text-stratosphere-900 flex items-center gap-2">
                    <UserCog className="h-5 w-5 text-primary-500" />
                    User Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 bg-white">
                  <div className="flex items-start gap-6">
                    <Avatar className="h-24 w-24 border-4 border-concrete-500 shadow-lg">
                      <AvatarImage src={selectedUser.photo} alt={selectedUser.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary-500 to-stratosphere-500 text-white text-2xl font-bold">
                        {getInitials(selectedUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-semibold text-sky-500 mb-1">Full Name</p>
                        <p className="text-lg font-semibold text-stratosphere-900">{selectedUser.name}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold text-sky-500 mb-1">Username</p>
                        <p className="text-lg text-stratosphere-700">@{selectedUser.userName}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold text-sky-500 mb-1 flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          Email Address
                        </p>
                        <p className="text-stratosphere-700">{selectedUser.email}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold text-sky-500 mb-1 flex items-center gap-1">
                          <Shield className="h-3.5 w-3.5" />
                          Primary Role
                        </p>
                        <Badge className="bg-primary-500 text-white capitalize font-medium">
                          {selectedUser.primaryRole?.replace(/([A-Z])/g, ' $1').trim() || 'None'}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold text-sky-500 mb-1">Account Type</p>
                        <div className="flex items-center gap-2">
                          {selectedUser.isConnectGoStaff ? (
                            <Badge className="bg-grass-500 text-white flex items-center gap-1.5">
                              <Shield className="h-3.5 w-3.5" />
                              ConnectGo Staff
                            </Badge>
                          ) : (
                            <Badge className="bg-sky-500 text-white flex items-center gap-1.5">
                              <Building className="h-3.5 w-3.5" />
                              Client User
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold text-sky-500 mb-1 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Member Since
                        </p>
                        <p className="text-stratosphere-700">
                          {new Date(selectedUser.createdAt || '').toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Archive User Button */}
                  <Separator className="my-6 bg-concrete-500" />
                  <div className="flex items-center justify-between p-4 bg-concrete-50 rounded-lg border border-concrete-500">
                    <div>
                      <h4 className="font-semibold text-stratosphere-900 flex items-center gap-2">
                        <Archive className="h-4 w-4 text-ochre-500" />
                        Archive User
                      </h4>
                      <p className="text-sm text-stratosphere-600 mt-1">
                        Archiving will remove this user's access to the platform
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-ochre-500 text-ochre-700 hover:bg-ochre-50"
                          disabled={archiving}
                        >
                          {archiving ? (
                            <>
                              <span className="animate-spin mr-2">⏳</span>
                              Archiving...
                            </>
                          ) : (
                            <>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive User
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border-concrete-500 bg-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-stratosphere-900 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-ochre-500" />
                            Archive User Account
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-stratosphere-700">
                            Are you sure you want to archive <span className="font-semibold">{selectedUser.name}</span>?
                            <div className="mt-4 p-4 bg-ochre-50 border border-ochre-200 rounded-lg space-y-2">
                              <p className="font-semibold text-ochre-700 flex items-center gap-2 text-sm">
                                <AlertTriangle className="h-4 w-4" />
                                This action will:
                              </p>
                              <ul className="text-sm text-stratosphere-600 space-y-1 ml-6 list-disc">
                                <li>Revoke all access to the platform</li>
                                <li>Remove from all organizations and projects</li>
                                <li>Prevent future logins</li>
                              </ul>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-concrete-500">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleArchiveUser}
                            className="bg-ochre-500 text-white hover:bg-ochre-600"
                          >
                            Archive User
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>

              {/* Two Column Layout for Role Management */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assign New Role */}
                <Card className="border-concrete-500 shadow-md bg-white">
                  <CardHeader className="bg-gradient-to-r from-stratosphere-50 to-grass-50 border-b border-concrete-500">
                    <CardTitle className="text-stratosphere-900 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary-500" />
                      Assign New Role
                    </CardTitle>
                    <CardDescription>
                      Add a role to grant access and permissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 bg-white">
                    <RoleAssignmentForm 
                      userId={selectedUser._id}
                      organizations={organizations}
                      onRoleAssigned={handleRoleAssigned}
                    />
                  </CardContent>
                </Card>

                {/* Current Role Summary */}
                <Card className="border-concrete-500 shadow-md bg-white">
                  <CardHeader className="bg-gradient-to-r from-stratosphere-50 to-sky-50 border-b border-concrete-500">
                    <CardTitle className="text-stratosphere-900 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary-500" />
                      Role Summary
                    </CardTitle>
                    <CardDescription>
                      Overview of assigned roles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 bg-white">
                    <div className="space-y-4">
                      <div className="p-4 bg-stratosphere-50 rounded-lg border border-concrete-500">
                        <p className="text-sm font-semibold text-sky-500 mb-2">Total Roles</p>
                        <p className="text-3xl font-bold text-stratosphere-900">
                          {selectedUser.roles?.length || 0}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-grass-50 rounded-lg border border-grass-200">
                        <p className="text-sm font-semibold text-sky-500 mb-2">Primary Role</p>
                        <Badge className="bg-primary-500 text-white text-base capitalize">
                          {selectedUser.primaryRole?.replace(/([A-Z])/g, ' $1').trim() || 'None'}
                        </Badge>
                      </div>

                      <div className="p-4 bg-sky-50 rounded-lg border border-sky-200">
                        <p className="text-sm font-semibold text-sky-500 mb-2">Organizations</p>
                        <p className="text-2xl font-bold text-stratosphere-900">
                          {new Set(selectedUser.roles?.map(r => r.organization).filter(Boolean)).size || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Current Roles Table */}
              <Card className="border-concrete-500 shadow-md bg-white">
                <CardHeader className="bg-gradient-to-r from-stratosphere-50 to-sky-50 border-b border-concrete-500">
                  <CardTitle className="text-stratosphere-900 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary-500" />
                    Active Roles
                  </CardTitle>
                  <CardDescription>
                    Manage existing roles and set primary role
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 bg-white">
                  <div className="p-6">
                    <UserRolesList
                      userId={selectedUser._id}
                      roles={selectedUser.roles || []}
                      primaryRole={selectedUser.primaryRole}
                      onRoleRemoved={handleRoleRemoved}
                      onPrimaryRoleChanged={handlePrimaryRoleChanged}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}