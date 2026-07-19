import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { PrismaService } from '../../prisma/prisma.service';
import jwt = require('jsonwebtoken');

@WebSocketGateway({
  cors: {
    origin: process.env.WS_CORS_ORIGIN || '*',
  },
  namespace: '/notifications'
})
@Injectable()
export class InAppNotificationService implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(InAppNotificationService.name);

  // Map employeeId to a set of socket IDs (to support multiple devices)
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      let token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      
      if (!token && client.handshake.headers?.cookie) {
        const cookies = client.handshake.headers.cookie.split(';');
        for (const cookie of cookies) {
          const [name, val] = cookie.trim().split('=');
          if (name === 'token') {
            token = decodeURIComponent(val);
            break;
          }
        }
      }

      if (!token) {
        this.logger.warn(`Client disconnected due to missing token: ${client.id}`);
        client.disconnect();
        return;
      }

      // Strict JWT verify without fallback
      let decoded: any = null;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      } catch (err) {
        this.logger.warn(`JWT verification failed: ${(err as any).message}`);
      }
      
      if (!decoded) {
        this.logger.warn(`Client disconnected due to invalid token: ${client.id}`);
        client.disconnect();
        return;
      }

      const employeeId = decoded.employeeId || decoded.sub || decoded.userId || 'system';
      
      // Store socket mapping
      if (!this.userSockets.has(employeeId)) {
        this.userSockets.set(employeeId, new Set());
      }
      this.userSockets.get(employeeId)!.add(client.id);

      // Join a personal room for targeted broadcasting even across Redis pub/sub
      client.join(`employee_${employeeId}`);
      
      this.logger.log(`Client connected: ${client.id} for Employee: ${employeeId}`);
    } catch (error) {
      this.logger.error(`Connection error: ${(error as any).message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Find and remove socket from our local map
    for (const [employeeId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(employeeId);
        }
        break;
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Pushes a real-time notification to the connected client(s) of a specific employee
   */
  async emitNotification(employeeId: string, notification: any) {
    const policy = await this.prisma.orgPolicy.findFirst();
    if (policy && !policy.inAppNotificationsEnabled) {
      this.logger.debug(`In-App notification to ${employeeId} blocked by OrgPolicy.`);
      return;
    }

    this.server.to(`employee_${employeeId}`).emit('new_notification', notification);
    this.logger.debug(`Emitted notification to employee_${employeeId}`);
  }

  async broadcastEvent(event: string, payload: any) {
    const policy = await this.prisma.orgPolicy.findFirst();
    if (policy && !policy.inAppNotificationsEnabled) {
      return;
    }

    this.server.emit(event, payload);
    this.logger.debug(`Broadcasted event ${event}`);
  }
}
