import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class RecordInterviewDto {
  @IsString()
  @IsOptional()
  feedback?: string;

  @IsString()
  @IsNotEmpty()
  interviewStatus!: string;
}
