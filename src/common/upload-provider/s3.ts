import { Upload } from './upload';

export class S3 implements Upload {
  async doUpload(options: any, file: any): Promise<string> {
    return 'upload s3 ne';
  }
}
