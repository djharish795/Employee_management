import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @RequirePermissions(RbacPermissions.DASHBOARD_VIEW)
  @Get()
  async globalSearch(@Query('q') q: string, @CurrentUser() user: any) {
    if (!q || q.length < 2) return { data: [] };
    const results = await this.searchService.globalSearch(q, user.role);
    return { data: results };
  }
}
