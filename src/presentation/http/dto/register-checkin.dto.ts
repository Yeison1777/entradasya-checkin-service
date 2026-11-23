import { IsString, IsUUID, Length, Matches } from 'class-validator';

export class RegisterCheckinDto {
  @IsUUID()
  eventId!: string;

  @IsString()
  @Length(32, 64)
  @Matches(/^[A-Za-z0-9_-]+$/)
  code!: string;
}
