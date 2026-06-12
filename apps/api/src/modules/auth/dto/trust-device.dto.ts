import { IsUUID } from "class-validator";

export class TrustDeviceDto {
  @IsUUID()
  challengeId!: string;
}
