import { IsString, IsBoolean, IsNotEmpty, IsIn } from 'class-validator';

export class BantUpdateDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['budgetConfirmed', 'authorityIdentified', 'needValidated', 'timelineEstablished'])
  field!: 'budgetConfirmed' | 'authorityIdentified' | 'needValidated' | 'timelineEstablished';

  @IsBoolean()
  value!: boolean;
}
