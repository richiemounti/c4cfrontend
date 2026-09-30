// components/admin/users/UserTable.tsx
'use client';

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BadgeCheck, User, Shield, Briefcase } from 'lucide-react';
import { User as UserType } from '@/types';

interface UserTableProps {
  users: UserType[];
  onUserSelect: (user: UserType) => void;
}

export default function UserTable({ users, onUserSelect }: UserTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    // Role tags are informational labels, not status/severity indicators —
    // use the petrol/informational treatment uniformly (see the matching
    // "Primary Role" badge in app/admin/users/roles/page.tsx) rather than a
    // decorative per-role rainbow.
    const roleColors: Record<string, string> = {
      owner: 'bg-c4c-petrol text-white hover:bg-black',
      admin: 'bg-c4c-petrol text-white hover:bg-black',
      accountManager: 'bg-c4c-petrol text-white hover:bg-black',
      manager: 'bg-c4c-petrol text-white hover:bg-black',
      projectCreator: 'bg-c4c-petrol text-white hover:bg-black',
      organiser: 'bg-c4c-petrol text-white hover:bg-black',
      reviewer: 'bg-c4c-petrol text-white hover:bg-black',
      fieldAgent: 'bg-c4c-petrol text-white hover:bg-black',
    };
    return roleColors[role] || 'bg-c4c-petrol text-white';
  };

  const getRoleIcon = (isStaff: boolean) => {
    return isStaff ? (
      <Shield className="h-3.5 w-3.5" />
    ) : (
      <Briefcase className="h-3.5 w-3.5" />
    );
  };

  return (
    <div className="border border-c4c-rule rounded-lg overflow-hidden shadow-sm bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-c4c-grey-bg border-b border-c4c-rule hover:bg-c4c-grey-bg">
            <TableHead className="font-semibold text-black">User</TableHead>
            <TableHead className="font-semibold text-black">Contact</TableHead>
            <TableHead className="font-semibold text-black">Primary Role</TableHead>
            <TableHead className="font-semibold text-black">Type</TableHead>
            <TableHead className="text-right font-semibold text-black">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <User className="h-12 w-12 mb-2 text-c4c-petrol" />
                  <p className="text-black">No users found</p>
                  <p className="text-sm text-c4c-petrol mt-1">Try adjusting your search filters</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow 
                key={user._id} 
                className="border-b border-c4c-rule hover:bg-c4c-grey-bg/30 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-c4c-rule">
                      <AvatarImage src={user.photo} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-c4c-petrol to-black text-white font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-black">{user.name}</p>
                      <p className="text-sm text-c4c-petrol">@{user.userName}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-black">{user.email}</p>
                </TableCell>
                <TableCell>
                  {user.primaryRole ? (
                    <Badge 
                      className={`${getRoleBadgeVariant(user.primaryRole)} capitalize font-medium`}
                    >
                      {user.primaryRole.replace(/([A-Z])/g, ' $1').trim()}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      No Role
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.isConnectGoStaff ? (
                      <Badge className="bg-c4c-sage text-white hover:bg-black flex items-center gap-1.5">
                        {getRoleIcon(true)}
                        Staff
                        <BadgeCheck className="h-3.5 w-3.5" />
                      </Badge>
                    ) : (
                      <Badge className="bg-c4c-petrol text-white hover:bg-black flex items-center gap-1.5">
                        {getRoleIcon(false)}
                        Client
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onUserSelect(user)}
                    className="border-c4c-rule text-c4c-petrol hover:bg-c4c-grey-bg font-medium"
                  >
                    Manage Roles
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}