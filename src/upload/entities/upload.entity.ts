import { BaseEntity } from '../../common/base.entity';
import { FileEntity } from '../../common/upload-provider/upload';

export class UploadEntity extends BaseEntity {
  filename?: string | null;
  size?: number;
  width?: number;
  height?: number;
  formats?: any | null;
  ext?: string | null;
  mime?: string | null;
  url?: string;
  userId?: string;

  static fromFileEntity(file: FileEntity, userId: string | null): UploadEntity {
    return {
      filename: file.name,
      size: file.size,
      width: file.width,
      height: file.height,
      formats: file.formats,
      ext: file.ext,
      mime: file.mime,
      url: file.path,
      userId: userId,
    };
  }
}
