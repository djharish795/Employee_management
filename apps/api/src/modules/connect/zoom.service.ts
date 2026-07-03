import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";

@Injectable()
export class ZoomService {
  private readonly logger = new Logger(ZoomService.name);
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  private accountId = process.env.ZOOM_ACCOUNT_ID;
  private clientId = process.env.ZOOM_CLIENT_ID;
  private clientSecret = process.env.ZOOM_CLIENT_SECRET;

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    if (!this.accountId || !this.clientId || !this.clientSecret) {
      throw new ServiceUnavailableException("Zoom Server-to-Server OAuth credentials not configured in .env");
    }

    try {
      const basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
      const response = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${this.accountId}`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Zoom auth failed: ${response.status} ${errText}`);
      }

      const data = await response.json() as { access_token: string, expires_in: number };
      this.accessToken = data.access_token;
      this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000; // subtract 60s for buffer
      return this.accessToken;
    } catch (error: any) {
      this.logger.error("Error getting Zoom access token:", error.message);
      throw new ServiceUnavailableException("Failed to authenticate with Zoom API");
    }
  }

  async createMeetEvent(
    title: string,
    description: string,
    startTime: Date,
    endTime: Date,
  ): Promise<{ meetLink: string; eventId: string }> {
    try {
      const token = await this.getAccessToken();
      const durationMins = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

      const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: title,
          agenda: description,
          type: 2, // Scheduled meeting
          start_time: startTime.toISOString(),
          duration: durationMins,
          timezone: "Asia/Kolkata",
          settings: {
            join_before_host: true,
            jbh_time: 0,
            waiting_room: false,
          }
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to create Zoom meeting: ${errText}`);
      }

      const data = await response.json() as { id: number, join_url: string };
      this.logger.log(`Created Zoom meeting: ${data.id}`);
      return { meetLink: data.join_url, eventId: data.id.toString() };
    } catch (error: any) {
      this.logger.error("Error creating Zoom meeting:", error.message);
      throw new ServiceUnavailableException(`Failed to create Zoom meeting: ${error.message}`);
    }
  }

  async updateMeetEvent(eventId: string, startTime: Date, endTime: Date): Promise<void> {
    try {
      const token = await this.getAccessToken();
      const durationMins = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

      const response = await fetch(`https://api.zoom.us/v2/meetings/${eventId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_time: startTime.toISOString(),
          duration: durationMins,
        }),
      });

      if (!response.ok) {
        this.logger.warn(`Failed to update Zoom meeting ${eventId}`);
      } else {
        this.logger.log(`Updated Zoom meeting: ${eventId}`);
      }
    } catch (error: any) {
      this.logger.error(`Error updating Zoom meeting ${eventId}`, error.message);
    }
  }

  async cancelMeetEvent(eventId: string): Promise<void> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(`https://api.zoom.us/v2/meetings/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.logger.warn(`Failed to delete Zoom meeting ${eventId}`);
      } else {
        this.logger.log(`Cancelled Zoom meeting: ${eventId}`);
      }
    } catch (error: any) {
      this.logger.error(`Error cancelling Zoom meeting ${eventId}`, error.message);
    }
  }
}
