import { Controller, Get } from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';

@Controller('holidays')
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  @RequirePermissions(RbacPermissions.EMPLOYEES_READ)
  @Get()
  getAllHolidays() {
    return this.holidaysService.getAllHolidays();
  }
}
