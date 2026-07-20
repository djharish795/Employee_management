import { IsString, IsBoolean, IsNotEmpty } from 'class-validator';

export class BantUpdateDto {
  @IsString()
  @IsNotEmpty()
  field!: 'budgetConfirmed' | 'authorityIdentified' | 'needValidated' | 'timelineEstablished';

  @IsBoolean()
  value!: boolean;
}
