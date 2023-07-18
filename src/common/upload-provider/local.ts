import { Upload } from './upload';
import * as fse from 'fs-extra';
import { Logger } from '@nestjs/common';
import { FileEntity } from './upload';
import * as path from 'path';
import * as fs from 'fs';
import { publicStaticPath } from '../../config';

export class Local implements Upload {
  private readonly logger = new Logger(Local.name);
  async doUpload(options: any, file: FileEntity): Promise<any> {
    try {
      const filename = path.basename(file.path);
      const uploadDir = options.uploadPath + '/' + file.folderId;
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }
      const dest = uploadDir + '/' + filename;
      fse.copyFileSync(file.path, dest);
      file.path = publicStaticPath + '/' + file.folderId + '/' + filename;
    } catch (err) {
      this.logger.error('Upload file local failed: ', err.message);
      throw err;
    }
    return;
  }
}
