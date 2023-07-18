import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { SignUpDto } from '../auth/dto/sign-up.dto';
import { badRequest, ErrorCodes } from '../common/error-codes';
import { nanoid } from 'nanoid';
import { validateEntity } from '../common/base.entity';
import * as _ from 'lodash';
import { ROLES } from '../auth/auth.acl';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private users: User[] = [
    {
      id: '1',
      username: 'john',
      password: 'changeme',
      email: 'john@changeme',
      roles: [ROLES.appUser],
      createAt: Date.now(),
      updateAt: Date.now(),
    },
    {
      id: '2',
      username: 'maria',
      password: 'guess',
      email: 'maria@guess',
      roles: [ROLES.appAdmin],
      createAt: Date.now(),
      updateAt: Date.now(),
    },
  ];

  async create(createUserDto: SignUpDto): Promise<User> {
    const user = this.users.find((user) => user.email === createUserDto.email);
    if (user) {
      return badRequest(ErrorCodes.emailAlreadyTaken);
    }

    const userToCreate: User = new User();
    userToCreate.id = nanoid();
    userToCreate.email = createUserDto.email;
    userToCreate.password = createUserDto.password;
    userToCreate.username = createUserDto.username;
    userToCreate.roles = [ROLES.appUser];
    await validateEntity(userToCreate);

    // TODO: execute sql here
    this.users.push(userToCreate);

    return userToCreate;
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string): Promise<User | undefined> {
    return this.users.find((user) => _.isEqual(user.id, id));
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.users.find((user) => _.isEqual(user.username, username));
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
