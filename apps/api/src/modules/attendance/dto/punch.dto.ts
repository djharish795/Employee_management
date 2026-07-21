import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class PunchDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(["IN", "OUT", "BREAK"])
  action!: "IN" | "OUT" | "BREAK";

  @IsString()
  @IsOptional()
  @MaxLength(128)
  idempotencyKey?: string;
}
