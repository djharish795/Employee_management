import { PartialType } from "@nestjs/mapped-types";
import { CreateClientDto } from "./create-client.dto";
import { IsOptional, IsNumber, IsString, Min, Max, IsIn } from "class-validator";

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(7)
  stage?: number;

  @IsOptional()
  @IsString()
  @IsIn(["ACTIVE", "CLOSED WON", "LOST"])
  clientHealth?: string;
}
