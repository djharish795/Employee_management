import { IsString, IsNotEmpty, IsIn } from "class-validator";

export class UpdateChecklistItemDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(["assetRecovery", "accountDeactivation", "finalSettlement", "knowledgeTransfer"])
  section!: "assetRecovery" | "accountDeactivation" | "finalSettlement" | "knowledgeTransfer";

  @IsString()
  @IsNotEmpty()
  itemId!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(["completed", "pending", "scheduled", "locked", "pending_manager"])
  status!: "completed" | "pending" | "scheduled" | "locked" | "pending_manager";
}
