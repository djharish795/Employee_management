import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class AssignAssetDto {
    @IsString()
    @IsNotEmpty()
    employeeId!: string;

    @IsString()
    @IsNotEmpty()
    assignedById!: string;

    @IsString()
    @IsOptional()
    notes?: string;
}
