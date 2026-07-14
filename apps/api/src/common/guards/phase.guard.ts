import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { REQUIRES_PHASE_KEY } from '../decorators/requires-phase.decorator';

@Injectable()
export class PhaseGuard implements CanActivate {
  constructor(private reflector: Reflector, private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPhase = this.reflector.getAllAndOverride<number>(REQUIRES_PHASE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPhase || requiredPhase <= 1) {
      return true;
    }

    if (requiredPhase === 2) {
      const isPhase2Enabled = this.configService.get<string>('PHASE_2_ENABLED') === 'true';
      if (!isPhase2Enabled) {
        throw new ForbiddenException("This feature is part of Phase 2, which is not yet enabled.");
      }
    }

    if (requiredPhase === 3) {
      const isPhase3Enabled = this.configService.get<string>('PHASE_3_ENABLED') === 'true';
      if (!isPhase3Enabled) {
        throw new ForbiddenException("This feature is part of Phase 3, which is not yet enabled.");
      }
    }

    return true;
  }
}
