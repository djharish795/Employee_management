import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * MasterAdminGuard — completely separate from all RBAC guards.
 * Validates the secret master admin JWT using a dedicated secret key.
 * Rejects every regular JWT including SUPER_ADMIN.
 */
@Injectable()
export class MasterAdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-master-admin-token'];

    if (!token) {
      throw new UnauthorizedException('Master admin token required');
    }

    try {
      const secret = process.env.MASTER_ADMIN_JWT_SECRET;
      if (!secret) throw new Error('MASTER_ADMIN_JWT_SECRET not configured');

      const payload = this.jwtService.verify(token, { secret });
      if (payload.type !== 'MASTER_ADMIN') {
        throw new UnauthorizedException('Invalid master admin token type');
      }
      request.masterAdmin = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired master admin token');
    }
  }
}
