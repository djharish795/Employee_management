import { IsIn, IsNotEmpty, IsString } from "class-validator";

export class ActionRegularizationDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(["APPROVE", "REJECT"])
  action!: "APPROVE" | "REJECT";
}
