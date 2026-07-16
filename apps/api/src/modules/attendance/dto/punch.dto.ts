import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class PunchDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(["IN", "OUT", "BREAK"])
  action!: "IN" | "OUT" | "BREAK";

  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}
