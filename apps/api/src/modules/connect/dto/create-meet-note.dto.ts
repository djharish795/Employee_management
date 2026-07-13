import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMeetNoteDto {
  @IsString()
  @IsNotEmpty()
  content!: string;
}
