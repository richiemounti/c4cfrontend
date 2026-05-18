// utils/permissions.ts
import { User, Role } from '@/types';

/**
 * Check if a user has access to a specific organization
 * @param user User object
 * @param organizationId Organization ID to check
 * @returns boolean indicating if user has access
 */
export const hasOrganizationAccess = (user: User | null, organizationId: string): boolean => {
  if (!user) return false;
  
  // ConnectGo staff have access to all organizations
  if (user.isConnectGoStaff) return true;
  
  // Check if user has a role for this organization
  if (user.roles) {
    return user.roles.some(role => 
      role.organization === organizationId
    );
  }
  
  return false;
};

/**
 * Check if a user has access to a specific project
 * @param user User object
 * @param projectId Project ID to check
 * @param organizationId Optional organization ID to check
 * @returns boolean indicating if user has access
 */
export const hasProjectAccess = (
  user: User | null, 
  projectId: string, 
  organizationId?: string
): boolean => {
  if (!user) return false;
  
  // ConnectGo staff have access to all projects
  if (user.isConnectGoStaff) return true;
  
  // Check if user has a role with access to this project
  if (user.roles) {
    return user.roles.some(role => {
      // Check if user is an organization manager (has access to all organization projects)
      if (role.role === 'manager' && organizationId && role.organization === organizationId) {
        return true;
      }
      
      // Check if project is specifically assigned to this role
      if (role.projects && role.projects.includes(projectId)) {
        return true;
      }
      
      return false;
    });
  }
  
  return false;
};

/**
 * Check if user has a specific permission
 * @param user User object
 * @param permission Permission to check
 * @returns boolean indicating if user has permission
 */
export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false;
  
  // Define permissions based on roles
  const rolePermissions: Record<string, string[]> = {
    // ConnectGo Roles
    owner: [
      'manage_all', 'billing_access', 'create_clients', 'system_settings',
      'export_all_reports', 'manage_users', 'delete_data'
    ],
    admin: [
      'create_clients', 'manage_users', 'system_settings', 'review_logs',
      'export_system_reports', 'create_projects'
    ],
    accountManager: [
      'manage_client_users', 'export_client_reports', 'oversee_projects'
    ],
    
    // Client Roles
    manager: [
      'manage_org_projects', 'approve_submissions', 'assign_roles',
      'export_org_reports'
    ],
    projectCreator: [
      'create_projects', 'configure_projects', 'export_project_reports'
    ],
    organiser: [
      'assign_tasks', 'manage_forms'
    ],
    reviewer: [
      'review_submissions', 'approve_reject_data'
    ],
    fieldAgent: [
      'view_assignments', 'submit_data'
    ]
  };

  // ConnectGo staff have special permissions
  if (user.isConnectGoStaff) {
    // Check if any ConnectGo role has this permission
    return ['owner', 'admin', 'accountManager'].some(role => 
      rolePermissions[role]?.includes(permission)
    );
  }

  // Check if user's primary role has this permission
  if (user.primaryRole) {
    return rolePermissions[user.primaryRole]?.includes(permission) || false;
  }

  return false;
};