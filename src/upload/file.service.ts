import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { Writable } from 'stream';
import * as mime from 'mime-types';
import { generateId, nameToSlug } from '../common/utils';
import * as crypto from 'crypto';
import { FileEntity } from '../common/upload-provider/upload';
import * as _ from 'lodash';

const bytesToKbytes = (bytes) => Math.round((bytes / 1000) * 100) / 100;
const FORMATS_TO_RESIZE = ['jpeg', 'png', 'webp', 'tiff', 'gif'];
const FORMATS_TO_PROCESS = [
  'jpeg',
  'png',
  'webp',
  'tiff',
  'svg',
  'gif',
  'avif',
];
const FORMATS_TO_OPTIMIZE = ['jpeg', 'png', 'webp', 'tiff', 'avif'];

const DEFAULT_BREAKPOINTS = {
  large: 1000,
  medium: 750,
  small: 500,
};

const breakpoints = {
  xlarge: 1920,
  large: 1000,
  medium: 750,
  small: 500,
  xsmall: 64,
};

const THUMBNAIL_RESIZE_OPTIONS = {
  width: 245,
  height: 156,
  fit: 'inside',
};

const randomSuffix = () => crypto.randomBytes(5).toString('hex');

@Injectable()
export class FileService {
  writableDiscardStream = (options) => {
    return new Writable({
      ...options,
      write(chunk, encding, callback) {
        setImmediate(callback);
      },
    });
  };

  writeStreamToFile = (stream, path) =>
    new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(path);
      // Reject promise if there is an error with the provided stream
      stream.on('error', reject);
      stream.pipe(writeStream);
      writeStream.on('close', resolve);
      writeStream.on('error', reject);
    });

  /**
   * {
   *   format: 'jpeg',
   *   size: 4761,
   *   width: 225,
   *   height: 225,
   *   space: 'srgb',
   *   channels: 3,
   *   depth: 'uchar',
   *   density: 72,
   *   chromaSubsampling: '4:2:0',
   *   isProgressive: false,
   *   hasProfile: false,
   *   hasAlpha: false
   * }
   * @param file
   */
  getMetadata = (file): Promise<any> =>
    new Promise((resolve, reject) => {
      const pipeline = sharp();
      pipeline.metadata().then(resolve).catch(reject);
      file.getStream().pipe(pipeline);
    });

  getDimensions = async (file) => {
    const { width = null, height = null } = await this.getMetadata(file);
    return { width, height };
  };

  resizeFileTo = async (file, options, { name, hash }) => {
    const filePath = path.join(file.tmpWorkingDirectory, hash);

    await this.writeStreamToFile(
      file.getStream().pipe(sharp().resize(options)),
      filePath,
    );
    const newFile: FileEntity = {
      name,
      hash,
      ext: file.ext,
      mime: file.mime,
      path: filePath,
      getStream: () => fs.createReadStream(filePath),
      folderId: file.folderId,
    };

    const { width, height, size } = await this.getMetadata(newFile);

    Object.assign(newFile, { width, height, size: bytesToKbytes(size) });
    return newFile;
  };

  generateThumbnail = async (file) => {
    if (
      file.width > THUMBNAIL_RESIZE_OPTIONS.width ||
      file.height > THUMBNAIL_RESIZE_OPTIONS.height
    ) {
      const newFile = await this.resizeFileTo(file, THUMBNAIL_RESIZE_OPTIONS, {
        name: `thumbnail_${file.name}`,
        hash: `thumbnail_${file.hash}`,
      });
      return newFile;
    }

    return null;
  };

  /**
   * Optimize image by:
   *    - auto orienting image based on EXIF data
   *    - reduce image quality
   *
   */
  optimize = async (file) => {
    const sizeOptimization = true; // TODO: check
    const autoOrientation = true; // TODO: check

    const newFile = { ...file };

    const { width, height, size, format } = await this.getMetadata(newFile);

    if (sizeOptimization || autoOrientation) {
      const transformer = sharp();
      // reduce image quality
      transformer[format]({ quality: sizeOptimization ? 80 : 100 });
      // rotate image based on EXIF data
      if (autoOrientation) {
        transformer.rotate();
      }
      file.hash =
        _.endsWith(file.hash, file.ext) == true
          ? file.hash
          : file.hash + file.ext;
      const filePath = path.join(
        file.tmpWorkingDirectory,
        `optimized-${file.hash}`,
      );

      await this.writeStreamToFile(
        file.getStream().pipe(transformer),
        filePath,
      );

      newFile.getStream = () => fs.createReadStream(filePath);
      newFile.path = filePath;
    }

    const {
      width: newWidth,
      height: newHeight,
      size: newSize,
    } = await this.getMetadata(newFile);

    if (newSize > size) {
      // Ignore optimization if output is bigger than original
      return { ...file, width, height, size: bytesToKbytes(size) };
    }

    return Object.assign(newFile, {
      width: newWidth,
      height: newHeight,
      size: bytesToKbytes(newSize),
    });
  };

  generateResponsiveFormats = async (file) => {
    const responsiveDimensions = true;

    if (!responsiveDimensions) return [];

    const originalDimensions = await this.getDimensions(file);

    return Promise.all(
      Object.keys(breakpoints).map((key) => {
        const breakpoint = breakpoints[key];

        if (this.breakpointSmallerThan(breakpoint, originalDimensions)) {
          return this.generateBreakpoint(key, {
            file,
            breakpoint,
          });
        }

        return undefined;
      }),
    );
  };

  generateBreakpoint = async (key, { file, breakpoint }) => {
    const newFile = await this.resizeFileTo(
      file,
      {
        width: breakpoint,
        height: breakpoint,
        fit: 'inside',
      },
      {
        name: `${key}_${file.name}`,
        hash: `${key}_${file.hash}`,
      },
    );
    return {
      key,
      file: newFile,
    };
  };

  breakpointSmallerThan = (breakpoint, { width, height }) => {
    return breakpoint < width || breakpoint < height;
  };

  /**
   *  Applies a simple image transformation to see if the image is faulty/corrupted.
   */
  isFaultyImage = (file) =>
    new Promise((resolve) => {
      file
        .getStream()
        .pipe(sharp().rotate())
        .on('error', () => resolve(true))
        .pipe(this.writableDiscardStream({}))
        .on('error', () => resolve(true))
        .on('close', () => resolve(false));
    });

  isOptimizableImage = async (file) => {
    let format;
    try {
      const metadata = await this.getMetadata(file);
      format = metadata.format;
    } catch (e) {
      // throw when the file is not a supported image
      return false;
    }
    return format && FORMATS_TO_OPTIMIZE.includes(format);
  };

  isResizableImage = async (file) => {
    let format;
    try {
      const metadata = await this.getMetadata(file);
      format = metadata.format;
    } catch (e) {
      // throw when the file is not a supported image
      return false;
    }
    return format && FORMATS_TO_RESIZE.includes(format);
  };

  isImage = async (file) => {
    let format;
    try {
      const metadata = await this.getMetadata(file);
      format = metadata.format;
    } catch (e) {
      // throw when the file is not a supported image
      return false;
    }
    return format && FORMATS_TO_PROCESS.includes(format);
  };

  enhanceAndValidateFile = async (
    file: Express.Multer.File,
    userId: string | null,
  ): Promise<FileEntity> => {
    let ext = path.extname(file.originalname);
    if (!ext) {
      ext = `.${mime.extension(file.mimetype)}`;
    }
    const usedName = file.originalname.normalize();
    const basename = path.basename(usedName, ext);

    const currentFile: FileEntity = {
      name: usedName,
      hash: this.generateFileName(basename, ext),
      ext,
      mime: file.mimetype,
      size: bytesToKbytes(file.size),
      tmpWorkingDirectory: file.destination,
      path: file.path,
      folderId: userId || generateId(),
    };

    currentFile.getStream = () => fs.createReadStream(file.path);

    if (await this.isImage(currentFile)) {
      if (await this.isFaultyImage(currentFile)) {
        throw new Error('File is not a valid image');
      }
      if (await this.isOptimizableImage(currentFile)) {
        return this.optimize(currentFile);
      }
    }
    return currentFile;
  };

  formatFileInfo = async ({ filename, type, size }) => {
    let ext = path.extname(filename);
    if (!ext) {
      ext = `.${mime.extension(type)}`;
    }
    const usedName = filename.normalize();
    const basename = path.basename(usedName, ext);

    const entity: any = {
      name: usedName,
      hash: this.generateFileName(basename, ext),
      ext,
      mime: type,
      size: bytesToKbytes(size),
    };

    return entity;
  };

  getFolderPath = async (folderId) => {
    if (!folderId) return '/';

    const parentFolder = { path: null };

    return parentFolder.path;
  };

  generateFileName = (name, ext) => {
    const baseName = nameToSlug(name);
    let filename = `${baseName}_${randomSuffix()}`;
    console.log('filename', _.endsWith(filename, ext), filename, ext);
    if (!_.endsWith(filename, ext)) filename += ext;
    return filename;
  };
}
