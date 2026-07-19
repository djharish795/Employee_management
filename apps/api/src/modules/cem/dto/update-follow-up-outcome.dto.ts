import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateFollowUpOutcomeDto {
  @IsString()
  @IsNotEmpty()
  outcome!: string;

  @IsString()
  @IsOptional()
  outcomeNote?: string;
}
