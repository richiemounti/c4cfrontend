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
    const roleColors: Record<string, string> = {
      owner: 'bg-gold-500 text-white hover:bg-gold-600',
      admin: 'bg-petrol-500 text-white hover:bg-petrol-600',
      accountManager: 'bg-sage-500 text-white hover:bg-sage-600',
      manager: 'bg-coral-500 text-white hover:bg-coral-600',
      projectCreator: 'bg-neutral-500 text-white hover:bg-neutral-600',
      organiser: 'bg-burgundy-500 text-white hover:bg-burgundy-600',
      reviewer: 'bg-coral-500 text-white hover:bg-coral-600',
      fieldAgent: 'bg-stone-500 text-ink-900 hover:bg-stone-600',
    };
    return roleColors[role] || 'bg-neutral-500 text-white';
  };

  const getRoleIcon = (isStaff: boolean) => {
    return isStaff ? (
      <Shield className="h-3.5 w-3.5" />
    ) : (
      <Briefcase className="h-3.5 w-3.5" />
    );
  };

  return (
    <div className="border border-stone-500 rounded-lg overflow-hidden shadow-sm bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-ink-50 border-b border-stone-500 hover:bg-ink-50">
            <TableHead className="font-semibold text-ink-900">User</TableHead>
            <TableHead className="font-semibold text-ink-900">Contact</TableHead>
            <TableHead className="font-semibold text-ink-900">Primary Role</TableHead>
            <TableHead className="font-semibold text-ink-900">Type</TableHead>
            <TableHead className="text-right font-semibold text-ink-900">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <User className="h-12 w-12 mb-2 text-neutral-500" />
                  <p className="text-ink-500">No users found</p>
                  <p className="text-sm text-neutral-500 mt-1">Try adjusting your search filters</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow 
                key={user._id} 
                className="border-b border-stone-100 hover:bg-ink-50/30 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-stone-500">
                      <AvatarImage src={user.photo} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-coral-500 to-ink-500 text-white font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-ink-900">{user.name}</p>
                      <p className="text-sm text-neutral-500">@{user.userName}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-ink-700">{user.email}</p>
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
                      <Badge className="bg-sage-500 text-white hover:bg-sage-600 flex items-center gap-1.5">
                        {getRoleIcon(true)}
                        Staff
                        <BadgeCheck className="h-3.5 w-3.5" />
                      </Badge>
                    ) : (
                      <Badge className="bg-neutral-500 text-white hover:bg-neutral-600 flex items-center gap-1.5">
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
                    className="border-coral-500 text-coral-500 hover:bg-coral-50 hover:text-coral-500 font-medium"
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