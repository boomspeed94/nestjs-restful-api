import { BaseEntity } from '../../common/base.entity';
import { IsNotEmpty, MinLength, IsEmail } from 'class-validator';
import { ErrorCodes } from '../../common/error-codes';

export class User extends BaseEntity {
  @IsNotEmpty()
  @MinLength(6, { message: ErrorCodes.usernameLength })
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6, { message: ErrorCodes.passwordLength })
  password: string;

  enabled?: boolean;
  deletedAt?: number;
  roles?: string[];
}
