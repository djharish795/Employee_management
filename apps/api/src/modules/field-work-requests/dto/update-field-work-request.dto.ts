import { PartialType } from "@nestjs/mapped-types";
import { CreateFieldWorkRequestDto } from "./create-field-work-request.dto";
import { IsOptional, IsEnum } from "class-validator";

export class UpdateFieldWorkRequestDto extends PartialType(CreateFieldWorkRequestDto) {
  @IsOptional()
  @IsEnum(["DRAFT", "PENDING", "APPROVED", "REJECTED", "CANCELLED"])
  status?: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

  @IsOptional()
  rejectionReason?: string;
}
