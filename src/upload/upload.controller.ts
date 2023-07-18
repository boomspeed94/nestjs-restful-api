import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UploadedFiles,
  UseInterceptors,
  ParseFilePipeBuilder,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ACL, PUBLIC_ACL } from '../auth/auth.acl';
import { fileStorage } from '../common/utils';

@ApiBearerAuth()
@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ACL(PUBLIC_ACL)
  @UseInterceptors(FilesInterceptor('files', 3, { storage: fileStorage }))
  async uploadFiles(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 100000000,
          message: 'reach limit',
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    files: Array<Express.Multer.File>,
    @Req() req,
  ) {
    return await this.uploadService.upload(files, req.user);
  }

  @Get()
  findAll() {
    return this.uploadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.uploadService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.uploadService.remove(+id);
  }
}
