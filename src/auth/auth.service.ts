import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/sign-up.dto';
import { JWT_OPTIONS } from '../config';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async issueToken(user: any): Promise<any> {
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user,
    };
  }

  async verifyToken(token: string): Promise<any> {
    return await this.jwtService.verifyAsync(token, {
      secret: JWT_OPTIONS.secret,
    });
  }

  async signIn(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }

    return this.issueToken(user);
  }

  async signUp(signUpData: SignUpDto): Promise<any> {
    const user = await this.usersService.create(signUpData);
    return await this.issueToken(user);
  }
}
