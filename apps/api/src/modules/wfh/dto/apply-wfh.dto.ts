import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class ApplyWfhDto {
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @IsDateString()
  @IsNotEmpty()
  date!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}
