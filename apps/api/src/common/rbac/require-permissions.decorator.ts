import { SetMetadata } from '@nestjs/common';
import { RbacPermissionType } from './rbac.config';

export const REQUIRE_PERMISSIONS_KEY = 'require_permissions_v2';

/**
 * Reusable metadata decorator for assigning granular permissions to endpoints.
 * Part of the future RBAC implementation.
 * Note: No guards are attached to this decorator yet per implementation constraints.
 *
 * @param permissions The required permissions for this route.
 */
export const RequirePermissions = (...permissions: RbacPermissionType[]) =>
  SetMetadata(REQUIRE_PERMISSIONS_KEY, permissions);
