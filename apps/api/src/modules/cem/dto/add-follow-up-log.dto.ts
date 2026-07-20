import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AddFollowUpLogDto {
  @IsString()
  @IsNotEmpty()
  type!: string; // 'CALL' | 'EMAIL' | 'MEETING'

  @IsString()
  @IsNotEmpty()
  summary!: string;

  @IsString()
  @IsOptional()
  nextActionDate?: string;
}
