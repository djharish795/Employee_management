import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Permission, UserRole } from "@naprocs/types";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { RbacService } from "../../modules/rbac/rbac.service";

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      throw new ForbiddenException("No permissions defined for this route (fail-closed)");
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.role) {
      throw new ForbiddenException("User role not found in request payload");
    }

    const hasPermission = this.rbacService.hasPermission(user.role as UserRole, requiredPermissions);
    
    if (!hasPermission) {
      throw new ForbiddenException("Insufficient permissions to access this resource");
    }

    return true;
  }
}
