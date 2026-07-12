import { Injectable, Logger } from "@nestjs/common";
import { AttendanceService } from "./attendance.service";

@Injectable()
export class AttendanceCronService {
  private readonly logger = new Logger(AttendanceCronService.name);

  constructor(private readonly attendanceService: AttendanceService) {}

  async forceAutoCheckout() {
    this.logger.log("Executing forced auto-checkout...");
    // Future implementation: logic to auto checkout employees who forgot to punch out
  }
}
