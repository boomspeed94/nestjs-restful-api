import { IsNotEmpty, IsEmail, MinLength, Length } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
export class SignUpDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6, { message: 'min length is 6' })
  password: string;

  @Length(10, 20)
  title?: string;
}
