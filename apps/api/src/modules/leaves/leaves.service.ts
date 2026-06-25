import { Injectable } from '@nestjs/common';
import { LeavesRepository } from './leaves.repository';
import { ApplyLeaveDto } from './dto/apply-leave.dto';

@Injectable()
export class LeavesService {
  constructor(private readonly leavesRepository: LeavesRepository) {}

  getLeaves(): any{
    return {
      message: 'All Leaves',
    };
  }

  async applyLeave(data: ApplyLeaveDto) {
    const totalDays =
      (new Date(data.endDate).getTime() -
        new Date(data.startDate).getTime()) /
        (1000 * 60 * 60 * 24) +
      1;

    const leave = await this.leavesRepository.applyLeave({
      employeeId: data.employeeId,
      leaveTypeId: data.leaveTypeId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      reason: data.reason,
      totalDays,
    });

    return {
      message: 'Leave Applied Successfully',
      data: leave,
    };
  }
}