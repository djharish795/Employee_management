import { IsOptional, IsString } from "class-validator";
import { PaginationParams } from "../../../common/utils/pagination.util";

export class GetOffboardingQueryDto extends PaginationParams {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  exitType?: string;
}
