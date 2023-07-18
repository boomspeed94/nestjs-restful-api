import { S3 } from './s3';
import { Local } from './local';
import { uploadOptions } from '../../config';
import { Upload } from './upload';

export enum UploadProvider {
  Local = 'local',
  S3 = 's3',
}
export class UploadFactory {
  static async doUpload(file: any): Promise<any> {
    let upload: Upload;
    const options = uploadOptions();
    if (options.provider === UploadProvider.S3) {
      upload = new S3();
    } else {
      upload = new Local();
    }
    await upload.doUpload(options, file);
  }
}
