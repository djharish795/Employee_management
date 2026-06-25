import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApplyLeaveDto } from './dto/apply-leave.dto';
import { LeavesService } from './leaves.service';

@Controller('leaves')
export class LeavesController {

  constructor(private readonly leaveService: LeavesService) {}

  @Get()
getLeaves(): any {
  return this.leaveService.getLeaves();
}

@Post('apply')
applyLeave(@Body() data: ApplyLeaveDto): Promise<any> {
  return this.leaveService.applyLeave(data);
}

}