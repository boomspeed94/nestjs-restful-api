import * as process from 'process';
import { UploadProvider } from './common/upload-provider/uploadFactory';
import { uploadPath } from './common/utils';

export const JWT_OPTIONS = {
  secret: process.env.JWT_SECRET_KEY || 'hehe',
  global: true,
  signOptions: { expiresIn: '600s' },
};

export const publicStaticPath = 'files';

export const uploadOptions = (): {
  provider: string;
  uploadPath?: string;
  credentials?: any;
} => {
  const options = {
    provider: process.env.UPLOAD_PROVIDER || 'local',
    uploadPath: undefined,
    credentials: {},
  };
  if (options.provider === UploadProvider.Local) {
    options.uploadPath = uploadPath();
    if (!options.uploadPath) {
      throw new Error('Missing upload path');
    }
  }

  if (options.provider === UploadProvider.S3) {
    const credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      bucketName: process.env.AWS_BUCKET_NAME,
    };

    if (!credentials.accessKeyId) {
      throw new Error('Missing AWS accessKeyId');
    }

    if (!credentials.secretAccessKey) {
      throw new Error('Missing AWS secretAccessKey');
    }

    if (!credentials.region) {
      throw new Error('Missing AWS region');
    }

    if (!credentials.bucketName) {
      throw new Error('Missing AWS bucketName');
    }
    options.credentials = credentials;
  }
  return options;
};
