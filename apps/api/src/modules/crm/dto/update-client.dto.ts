import { PartialType } from "@nestjs/mapped-types";
import { CreateClientDto } from "./create-client.dto";
import { IsOptional, IsNumber, IsString } from "class-validator";

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @IsOptional()
  @IsNumber()
  stage?: number;

  @IsOptional()
  @IsString()
  clientHealth?: string;
}
