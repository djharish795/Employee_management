import { IsDateString, IsNotEmpty } from "class-validator";

export class RescheduleMeetDto {
  @IsDateString()
  @IsNotEmpty()
  startTime!: string;

  @IsDateString()
  @IsNotEmpty()
  endTime!: string;
}
