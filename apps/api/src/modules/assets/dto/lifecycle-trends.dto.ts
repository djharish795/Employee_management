import { IsOptional, IsDateString, IsIn } from "class-validator";

export class GetLifecycleTrendsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(["MONTH", "QUARTER"], {
    message: "interval must be either 'MONTH' or 'QUARTER'",
  })
  interval?: string;
}
