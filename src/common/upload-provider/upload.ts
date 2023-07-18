export interface Upload {
  doUpload(options: any, file: any): Promise<string>;
}

export class FileEntity {
  name?: string;
  hash?: string;
  ext?: string;
  mime?: string;
  size?: number;
  tmpWorkingDirectory?: string;
  path?: string;
  folderId?: string;
  width?: number | 0;
  height?: number | 0;
  formats?: any;

  getStream?: () => any;
}
