import { SetMetadata } from '@nestjs/common';

// Roles list
export const ROLES = {
  systemAdmin: 'system_admin',
  appAdmin: 'app_admin',
  appUser: 'app_user',
  public: 'public',
};

export const SYS_ADMIN_ACL = [ROLES.systemAdmin];
export const APP_ADMIN_ACL = [ROLES.systemAdmin, ROLES.appAdmin];
export const APP_USER_ACL = [ROLES.systemAdmin, ROLES.appAdmin, ROLES.appUser];
export const PUBLIC_ACL = [
  ROLES.systemAdmin,
  ROLES.appAdmin,
  ROLES.appUser,
  ROLES.public,
];
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Access control list
export const ACL = (acl: string[]) => SetMetadata('acl', acl);
