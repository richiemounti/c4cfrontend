// utils/permissions.ts
import { User, IPermissions } from '@/types';

/**
 * Check if a user has access to a specific organization
 */
export const hasOrganizationAccess = (user: User | null, organizationId: string): boolean => {
  if (!user) return false;

  // ConnectGo staff have access to all organizations
  if (user.isConnectGoStaff) return true;

  if (user.roles) {
    return user.roles.some(role => role.organization === organizationId);
  }

  return false;
};

/**
 * Check if a user is an org-admin, optionally scoped to a specific organization.
 * Org-admins bypass every permission flag check within their organization.
 */
export const isOrgAdmin = (user: User | null, organizationId?: string): boolean => {
  if (!user) return false;
  if (user.isConnectGoStaff) return true;
  if (!user.roles) return false;

  const rolesToCheck = organizationId
    ? user.roles.filter(role => role.organization === organizationId)
    : user.roles;

  return rolesToCheck.some(role => role.isOrgAdmin === true);
};

/**
 * Check if a user has access to a specific project
 */
export const hasProjectAccess = (
  user: User | null,
  projectId: string,
  organizationId?: string
): boolean => {
  if (!user) return false;

  // ConnectGo staff have access to all projects
  if (user.isConnectGoStaff) return true;

  if (user.roles) {
    return user.roles.some(role => {
      if (organizationId && role.organization !== organizationId) return false;

      // Org-admins have access to all of their organization's projects
      if (role.isOrgAdmin && role.organization) return true;

      // Check if project is specifically assigned to this role
      if (role.projects && role.projects.includes(projectId)) return true;

      return false;
    });
  }

  return false;
};

// Maps the 6 client-facing permission strings onto the IPermissions flags.
const PERMISSION_FLAG_MAP: Record<string, keyof IPermissions> = {
  submit_data: 'submitData',
  data_collector: 'useDataCollector',
  risk_register: 'viewRiskRegister',
  report: 'generateReports',
  learn_and_tell: 'learnAndTell',
  invite_users: 'inviteUsers',
  assign_roles: 'inviteUsers',
};

/**
 * Check if a user has a specific (flag-checkable) permission, optionally
 * scoped to an organization. Org-admins and ConnectGo staff bypass this
 * entirely; everyone else is checked against their role's permission flags.
 */
export const hasPermission = (
  user: User | null,
  permission: string,
  organizationId?: string
): boolean => {
  if (!user) return false;
  if (user.isConnectGoStaff) return true;
  if (!user.roles) return false;

  const rolesToCheck = organizationId
    ? user.roles.filter(role => role.organization === organizationId)
    : user.roles;

  if (rolesToCheck.some(role => role.isOrgAdmin)) return true;

  const flagKey = PERMISSION_FLAG_MAP[permission];
  if (!flagKey) return false;

  return rolesToCheck.some(role => role.permissions?.[flagKey] === true);
};

// Convenience wrappers for the 6 permission flags, scoped to an organization.
export const canSubmitData = (user: User | null, organizationId?: string): boolean =>
  isOrgAdmin(user, organizationId) || hasPermission(user, 'submit_data', organizationId);

export const canUseDataCollector = (user: User | null, organizationId?: string): boolean =>
  isOrgAdmin(user, organizationId) || hasPermission(user, 'data_collector', organizationId);

export const canViewRiskRegister = (user: User | null, organizationId?: string): boolean =>
  isOrgAdmin(user, organizationId) || hasPermission(user, 'risk_register', organizationId);

export const canGenerateReports = (user: User | null, organizationId?: string): boolean =>
  isOrgAdmin(user, organizationId) || hasPermission(user, 'report', organizationId);

export const canLearnAndTell = (user: User | null, organizationId?: string): boolean =>
  isOrgAdmin(user, organizationId) || hasPermission(user, 'learn_and_tell', organizationId);

export const canInviteUsers = (user: User | null, organizationId?: string): boolean =>
  isOrgAdmin(user, organizationId) || hasPermission(user, 'invite_users', organizationId);
