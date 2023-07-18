import { Injectable } from '@nestjs/common';
import { FileService } from './file.service';
import * as _ from 'lodash';
import { UploadFactory } from '../common/upload-provider/uploadFactory';
import { FileEntity } from '../common/upload-provider/upload';
import * as fs from 'fs';
import {
  badRequest,
  ErrorCodes,
  internalServerError,
} from '../common/error-codes';
import { Prisma } from '@prisma/client';
import { UploadEntity } from './entities/upload.entity';
import { PrismaService } from '../common/prisma.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class UploadService {
  constructor(
    private fileService: FileService,
    private prisma: PrismaService,
  ) {}

  async upload(files: Array<Express.Multer.File>, user: User | null) {
    if (files.length <= 0) return badRequest(ErrorCodes.filesEmpty);
    let uploadedFiles = [];
    try {
      const doUpload = async (file) => {
        const fileData: FileEntity =
          await this.fileService.enhanceAndValidateFile(file, user?.id);
        return await this.uploadFileAndPersist(fileData, user?.id);
      };

      uploadedFiles = await Promise.all(files.map((file) => doUpload(file)));
    } catch (ex) {
      return internalServerError(ErrorCodes.uploadFailed, {
        message: ex.message,
      });
    }
    return uploadedFiles;
  }

  async add(entity: UploadEntity) {
    const input: Prisma.FileCreateInput = {
      filename: entity.filename,
      size: entity.size,
      width: entity.width,
      height: entity.height,
      formats: entity.formats,
      ext: entity.ext,
      mime: entity.mime,
      url: entity.url,
      userId: entity.userId,
    };

    const uploaded: UploadEntity = await this.prisma
      .xprisma()
      .file.create({ data: input });

    return uploaded;
  }

  async addToMedia(
    fileId: string,
    relatedType: string,
    relatedId: string,
    fieldName: string,
    _order: number | 0,
  ) {
    const mediaData: Prisma.MediaUncheckedCreateInput = {
      relatedId: relatedId,
      relatedType: relatedType as any,
      field: fieldName,
      order: _order,
      fileId: fileId,
    };

    return await this.prisma.xprisma().media.create({ data: mediaData });
  }

  findAll() {
    return `This action returns all upload`;
  }

  findOne(id: number) {
    return `This action returns a #${id} upload`;
  }

  remove(id: number) {
    return `This action removes a #${id} upload`;
  }

  uploadFileAndPersist = async (
    fileData: FileEntity,
    userId: string | null,
  ) => {
    if (await this.fileService.isImage(fileData)) {
      await this.uploadImage(fileData);
    } else {
      await UploadFactory.doUpload(fileData);
    }

    if (fs.existsSync(fileData.tmpWorkingDirectory)) {
      fs.rmSync(fileData.tmpWorkingDirectory, { recursive: true, force: true });
    }
    return this.add(UploadEntity.fromFileEntity(fileData, userId));
  };

  uploadImage = async (fileData) => {
    // Store width and height of the original image
    const { width, height } = await this.fileService.getDimensions(fileData);

    // Make sure this is assigned before calling any upload
    // That way it can mutate the width and height
    _.assign(fileData, {
      width,
      height,
    });

    // For performance reasons, all uploads are wrapped in a single Promise.all
    const uploadThumbnail = async (thumbnailFile) => {
      await UploadFactory.doUpload(thumbnailFile);
      _.set(fileData, 'formats.thumbnail', thumbnailFile);
    };

    // Generate thumbnail and responsive formats
    const uploadResponsiveFormat = async (format) => {
      const { key, file } = format;
      await UploadFactory.doUpload(file);
      _.set(fileData, ['formats', key], file);
    };

    const uploadPromises = [];

    // Upload image
    uploadPromises.push(UploadFactory.doUpload(fileData));

    // Generate & Upload thumbnail and responsive formats
    if (await this.fileService.isResizableImage(fileData)) {
      const thumbnailFile = await this.fileService.generateThumbnail(fileData);
      if (thumbnailFile) {
        uploadPromises.push(uploadThumbnail(thumbnailFile));
      }

      const formats = await this.fileService.generateResponsiveFormats(
        fileData,
      );
      if (Array.isArray(formats) && formats.length > 0) {
        for (const format of formats) {
          // eslint-disable-next-line no-continue
          if (!format) continue;
          uploadPromises.push(uploadResponsiveFormat(format));
        }
      }
    }
    // Wait for all uploads to finish
    await Promise.all(uploadPromises);
  };
}
