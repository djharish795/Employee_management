import { IsString, IsUUID, Length } from "class-validator";

export class MfaVerifyDto {
  @IsString()
  @Length(6, 6)
  code!: string;

  @IsUUID()
  challengeId!: string;
}
