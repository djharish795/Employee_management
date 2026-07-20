import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AddMeetingLogDto {
  @IsString()
  @IsNotEmpty()
  date!: string;

  @IsString()
  @IsNotEmpty()
  time!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsString()
  @IsOptional()
  outcome?: string;
}
