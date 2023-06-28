import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { generateId } from './utils';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

  xprisma(): any {
    return this.$extends({
      name: 'Before CRUD',
      query: {
        $allModels: {
          async create({ operation, model, args, query }) {
            const data = args.data;
            data.id = generateId();
            data.createAt = Date.now();
            data.updateAt = Date.now();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            data.deleteAt = 0;
            args = { ...args, data };
            return query(args);
          },
          async update({ operation, model, args, query }) {
            const data = args.data;
            data.updateAt = Date.now();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            args = { ...args, data };
            return query(args);
          },
        },
      },
    });
  }
}
