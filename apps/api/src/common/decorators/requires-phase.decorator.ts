import { SetMetadata } from '@nestjs/common';

export const REQUIRES_PHASE_KEY = 'requires_phase';
export const RequiresPhase = (phase: number) => SetMetadata(REQUIRES_PHASE_KEY, phase);
