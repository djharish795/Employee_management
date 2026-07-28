import { IsString, IsOptional, IsNumber, IsArray, Min, Max } from 'class-validator';

export class UpsertDailyLogDto {
  @IsString()
  summary!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tasksDone?: string[];

  @IsNumber()
  @Min(0)
  @Max(24)
  @IsOptional()
  hoursLogged?: number;
}
