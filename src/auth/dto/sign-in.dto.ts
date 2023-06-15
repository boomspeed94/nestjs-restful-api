import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;
}
