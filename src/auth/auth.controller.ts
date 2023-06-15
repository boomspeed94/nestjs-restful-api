import {
  Controller,
  HttpStatus,
  Get,
  Post,
  Body,
  Req,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ACL, PUBLIC_ACL } from './auth.acl';
import { SignUpDto } from './dto/sign-up.dto';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @ACL(PUBLIC_ACL)
  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @ACL(PUBLIC_ACL)
  @Post('login')
  async signIn(@Body() signInDto: SignInDto) {
    return await this.authService.signIn(
      signInDto.username,
      signInDto.password,
    );
  }

  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }
}
