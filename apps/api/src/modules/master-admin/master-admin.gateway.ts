import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { MasterAdminAuthService } from './master-admin-auth.service';
import { ActivityService } from './activity.service';
import { RedisService } from '../../redis/redis.service';

@WebSocketGateway({
  cors: {
    origin: process.env.WS_CORS_ORIGIN || '*',
  },
  namespace: '/master-admin-telemetry'
})
@Injectable()
export class MasterAdminGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MasterAdminGateway.name);
  private pollingInterval: NodeJS.Timeout | null = null;
  private connectedAdmins = 0;
  private networkTraceSub: any = null;

  constructor(
    private readonly authService: MasterAdminAuthService,
    private readonly activityService: ActivityService,
    private readonly redis: RedisService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.['x-master-admin-token'];

      if (!token) {
        this.logger.warn(`Telemetry client disconnected: Missing token`);
        client.disconnect();
        return;
      }

      // Verify token
      const isValid = await this.authService.verifyToken(token);
      if (!isValid) {
        this.logger.warn(`Telemetry client disconnected: Invalid token`);
        client.disconnect();
        return;
      }

      this.connectedAdmins++;
      this.logger.log(`Master Admin connected to telemetry stream: ${client.id}. Total connected: ${this.connectedAdmins}`);

      // Start the zero-latency stream if it's not already running
      this.startTelemetryStream();

      // Immediately send the first payload
      const initialData = await this.activityService.getOnlineNow();
      client.emit('telemetry_update', initialData);

    } catch (error) {
      this.logger.error(`Connection error: ${(error as Error).message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedAdmins = Math.max(0, this.connectedAdmins - 1);
    this.logger.log(`Master Admin disconnected. Total connected: ${this.connectedAdmins}`);
    
    // Stop the stream if no admins are watching to save resources
    if (this.connectedAdmins === 0) {
      this.stopTelemetryStream();
    }
  }

  private startTelemetryStream() {
    if (this.pollingInterval) return;

    this.logger.log(`Starting Zero-Latency Telemetry Stream (2000ms heartbeat)`);
    // Push updates every 2 seconds
    this.pollingInterval = setInterval(async () => {
      try {
        const liveNow = await this.activityService.getOnlineNow();
        this.server.emit('telemetry_update', liveNow);
      } catch (err) {
        this.logger.error(`Failed to fetch telemetry data: ${(err as Error).message}`);
      }
    }, 2000);

    // Subscribe to Network Traces
    try {
      this.networkTraceSub = this.redis.getClient().duplicate();
      this.networkTraceSub.subscribe('API_NETWORK_TRACES');
      this.networkTraceSub.on('message', (channel: string, message: string) => {
        if (channel === 'API_NETWORK_TRACES') {
          this.server.emit('network_trace', JSON.parse(message));
        }
      });
    } catch (e) {
      this.logger.error('Failed to subscribe to network traces', e);
    }
  }

  private stopTelemetryStream() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.logger.log(`Stopped Telemetry Stream to conserve server resources.`);
    }
    if (this.networkTraceSub) {
      this.networkTraceSub.quit();
      this.networkTraceSub = null;
    }
  }
}
