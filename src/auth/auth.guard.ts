import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { APP_USER_ACL, PUBLIC_ACL } from './auth.acl';
import * as _ from 'lodash';
import { UsersService } from '../users/users.service';
import { ErrorCodes } from '../common/error-codes';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  constructor(
    private authService: AuthService,
    private reflector: Reflector,
    private userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let acl = this.reflector.get<string[]>('acl', context.getHandler());
    if (!acl) {
      acl = APP_USER_ACL;
    }

    // PUBLIC ACL then return
    if (_.isEqual(acl, PUBLIC_ACL)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(ErrorCodes.unauthorized);
    }
    let userId;
    try {
      const { sub } = await this.authService.verifyToken(token);
      userId = sub;
    } catch (e) {
      throw new UnauthorizedException(ErrorCodes.unauthorized);
    }

    if (!userId) {
      throw new UnauthorizedException(ErrorCodes.unauthorized);
    }
    const user: User = await this.userService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException(ErrorCodes.unauthorized);
    }
    request['user'] = user;
    this.logger.log(`Authorized user with roles, ${user.roles}, acl: ${acl}`);
    let hasPermission = false;
    for (const r of user.roles) {
      if (_.includes(acl, r)) {
        hasPermission = true;
      }
    }

    if (hasPermission) {
      return true;
    }

    throw new ForbiddenException(ErrorCodes.forbidden);
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
