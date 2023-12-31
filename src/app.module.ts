import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { JWT_OPTIONS, publicStaticPath } from './config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { UploadModule } from './upload/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { uploadPath } from './common/utils';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    JwtModule.register(JWT_OPTIONS),
    UploadModule,
    ServeStaticModule.forRoot({
      rootPath: uploadPath(),
      exclude: ['/api/(.*)'],
      serveRoot: `/${publicStaticPath}/`,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
