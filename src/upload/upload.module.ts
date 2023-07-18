import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { FileService } from './file.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService, FileService, PrismaService],
  exports: [FileService],
})
export class UploadModule {}
