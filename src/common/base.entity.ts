import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

export class BaseEntity {
  id: string;
  createAt: number;
  updateAt: number;
  deleteAt?: number;
}

export const validateEntity = async (
  entity: BaseEntity,
): Promise<Error | boolean> => {
  const validationErrors = await validate(entity);
  if (validationErrors.length > 0) {
    const constraints: object = validationErrors[0].constraints;
    if (Object.keys(constraints).length > 0) {
      const message = Object.values(constraints).at(0);
      throw new BadRequestException(message);
    }
  }
  return true;
};
