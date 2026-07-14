import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMeetNoteCommentDto {
  @IsString()
  @IsNotEmpty()
  content!: string;
}
