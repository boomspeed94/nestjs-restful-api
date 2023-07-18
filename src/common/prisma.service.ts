import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { generateId, unAuditModels } from './utils';
import * as _ from 'lodash';

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

            if (!_.includes(unAuditModels, model)) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              data.deleteAt = 0;

              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              data.createAt = Date.now();

              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              data.updateAt = Date.now();
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            args = { ...args, data };
            return query(args);
          },
          async update({ operation, model, args, query }) {
            const data = args.data;
            if (!_.includes(unAuditModels, model)) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              data.updateAt = Date.now();
            }

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
