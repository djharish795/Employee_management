import {
  Controller, Post, Body, Req, HttpCode, HttpStatus, UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TelemetryBufferService } from './telemetry-buffer.service';
import { ActivityService } from './activity.service';
import { AnomalyEngineService } from './anomaly-engine.service';
import { RedisService } from '../../redis/redis.service';

@Controller('telemetry')
export class TelemetryController {
  constructor(
    private readonly activityService: ActivityService,
    private readonly bufferService: TelemetryBufferService,
    private readonly anomalyEngine: AnomalyEngineService,
    private readonly redis: RedisService
  ) {}

  @Post('heartbeat')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  async heartbeat(
    @Body() body: { page: string; sessionId: string; internetIp?: string; deviceData?: any; idleTimeMs?: number; isTabFocused?: boolean },
    @Req() req: any
  ) {
    // Identities from secure JWT payload
    const userId = req.user?.sub || req.user?.userId || 'unknown';
    const employeeId = req.user?.employeeId || userId;

    // Network IP (Internal/VPN/Proxy)
    const networkIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const ua = req.headers['user-agent'] || '';

    // Handle heartbeat update for Live Now
    this.activityService.handleHeartbeat(
      employeeId, 
      userId, 
      body.page, 
      body.sessionId, 
      networkIp,
      body.internetIp || 'unknown',
      body.deviceData,
      ua,
      body.idleTimeMs,
      body.isTabFocused
    ).catch(() => {});

    // Analyze for anomalies synchronously so they can be flagged instantly
    const role = req.user?.role || 'EMPLOYEE';
    this.anomalyEngine.evaluate({
      employeeId,
      userId,
      page: body.page || '/',
      internetIp: body.internetIp || 'unknown',
      deviceData: body.deviceData || {}
    }, role).catch(() => {});

    // Ingest into Zero-Latency Buffer for History
    this.bufferService.ingestEvent({
      employeeId,
      userId,
      page: body.page || '/',
      ipAddress: networkIp,
      internetIp: body.internetIp || 'unknown',
      deviceData: body.deviceData || {},
      timestamp: Date.now()
    }).catch(() => {});
    
    // GHOST HIJACK CHECK
    let override = null;
    try {
      const client = this.redis.getClient();
      const hijackRaw = await client.get(`EMS_HIJACK_PENDING:${employeeId}`);
      if (hijackRaw) {
        override = JSON.parse(hijackRaw);
        await client.del(`EMS_HIJACK_PENDING:${employeeId}`); // Consume it once
      }
    } catch (e) {}

    return { received: true, override };
  }

  @Post('activity')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  async trackActivity(@Body() body: { events: any[] }, @Req() req: any) {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const ua = req.headers['user-agent'] || '';
    this.activityService.trackActivity(body.events, ip, ua).catch(() => {});
    return { received: true };
  }
}
