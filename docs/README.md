Backend technical stacks for restful API services

### Introduce
A boilerplate

### Concepts
- [Framework/Library: NestJS](#nestjs) 
- [Project structure](#project-structure)
- [RestFul API](#restful-api)
- [HTTP status handler](#http-status-handler)
- [API documentation](#api-documentation)
- [Authentication/Authorization: Guard](#authenticationauthorization-guard)
- [Environment variable](#environment-variable)
- [Database](#database)
- [Prisma and Custom Prisma](#prisma-and-custom-prisma)
- [Upload service](#upload-service)
- [Email services](#email-services)
- [Log file storage](#log-file-storage)
- [CI/CD](#cicd)

### NestJS
- A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
- Ref: https://nestjs.com/

### Project structure
``` 
.
|-- docs
|-- |-- README.md
|-- prisma
|-- |-- migrations
|-- schema.prisma
|-- src
|-- |-- auth
|-- |   |-- auth.controller.ts
|-- |   |-- auth.guard.ts
|-- |   |-- auth.module.ts
|-- |   |-- auth.service.ts
|-- |-- common
|-- |   |-- upload-provider
|-- |   |-- base.entity.ts
|-- |   |-- error.codes.ts
|-- |   |-- image.uitils.ts
|-- |   |-- prisma.service.ts
|-- |   |-- utils.ts
|-- |-- upload
|-- |   |-- entities
|-- |   |-- |-- upload.entity.ts
|-- |   |-- upload.controller.ts
|-- |   |-- upload.module.ts
|-- |   |-- upload.service.ts
|-- |-- models
|-- |   |-- dto
|-- |   |-- entities
|-- |   |-- |-- model.entity.ts
|-- |   |-- model.controller.ts
|-- |   |-- model.module.ts
|-- |   |-- model.service.ts
|-- app.controller.ts
|-- app.module.ts
|-- app.service.ts
|-- config.ts
|-- main.ts
|-- test
package.json
```

### RestFul API
- An API, or application programming interface, is a set of rules that define how applications or devices can connect to and communicate with each other. A REST API is an API that conforms to the design principles of the REST, or representational state transfer architectural style. For this reason, REST APIs are sometimes referred to RESTFul APIs.
- Ref: https://www.ibm.com/topics/rest-apis

### HTTP status handler
- Relative path: `/src/common/error-codes.ts`
- The code definition include: `{code}::{message}<%= variable %>`
  - code: the system unique error code
  - message: the text message that developer want to throw
  - variable: allow injecting the extra error message
- General error function: 
  - badRequest: throw HTTP bad request 400
  - unauthorized: throw HTTP unauthorized 401
  - forbidden: throw HTTP forbidden 403
  - ...

### API documentation
- Use NestJS OpenAPI to export API documentation: https://docs.nestjs.com/openapi/introduction
- Global config: `/src/main.ts`
```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  // swagger documentation
  const options = new DocumentBuilder()
    .setTitle('NestJS RestFul App')
    .setDescription('The API description!!!')
    .setVersion('1.0')
    .addBearerAuth()
    .setExternalDoc('Postman Collection', '/docs-json')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/docs', app, document);
}
```
- Swagger documentation: http://localhost:3000/docs
- How to import swagger to Postman: 
    - Postman --> Import
    - Enter URL: http://localhost:3000/docs-json
### Authentication/Authorization: Guard
- NestJS `Guard`: https://docs.nestjs.com/security/authentication
- Implement Guard CanActivate `/src/auth/auth.guard.ts`
- Define Guard access control list: `/src/auth/auth.acl.ts`
```typescript
import { SetMetadata } from '@nestjs/common';
export const ACL = (acl: string[]) => SetMetadata('acl', acl);
```
  - Implement: `/src/auth/auth.acl.ts`
  - Default: no ACL declaration which mean require user login
  - Declare ACL with action require another permission
  - Define role list: `export const ROLES`
- Using ACL:
```typescript
export class ExampleController {
  // Default: no ACL decaleration which mean require user login
  async example() {
    return;
  }

  // Declare ACL with action require aother permission
  @ACL(PUBLIC_ACL)
  async example() {
    return;
  }
}
```

### Environment variable
- One env file for each environment: `.env.{stage}`
- Example:
  - `.env.dev`: config for develop environment
  - `.env.test`: config for testing environment
- Load variable environment: `/src/main.ts`
```typescript
import * as dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.APP_ENV}` });
```

### Database
- Postgres 15 newest LTS version: https://www.postgresql.org/about/news/postgresql-15-released-2526/
- Docker: `docker-compose.yml`
- ORM: `Prisma` https://docs.nestjs.com/recipes/prisma#set-up-prisma
- Database configuration: `.env.{stage}`
```typescript
    DATABASE_PORT=5433
    DATABASE_USERNAME=test
    DATABASE_PASSWORD=demone
    DATABASE_NAME=demo
    DATABASE_URL="postgresql://test:demone@localhost:5433/demo?schema=public"
```

### Prisma and Custom Prisma
- Schema: `/prisma/schema.prisma`
- To develop with schema updating: `pnpm db:develop`
- To update database from migration file: `pnpm db:{stage}`, stage is environment file
- Custom Prisma client: `/src/common/prisma.service.ts`
- Using prisma:
```typescript
// example.module.ts
import { PrismaService } from '../common/prisma.service';
@Module({
  providers: [PrismaService],
})
export class ExampleModule {}

@Injectable()
export class ExampleService {
  constructor(
    private prisma: PrismaService,
  ) {}

  // usage
  // await this.prisma.xprisma().entity.function
}
```
### Upload service
- A module support upload media files in to services (local, s3,...)
- Local upload:
  - Storage directory config: .env --> DATA_PATH
  - Public static files: `/src/app.module.ts`
  ```typescript
    import { ServeStaticModule } from '@nestjs/serve-static';
  @Module({
  imports: [ServeStaticModule.forRoot({
      rootPath: uploadPath(),
      exclude: ['/api/(.*)'],
      serveRoot: `/${publicStaticPath}/`,
    }),
  ]})
    ```
- Cloud Upload: s3
  - // TODO

### Email services
// TODO
### Log file storage
// TODO
### CI/CD
// TODO
