'use strict';

/**
 * Image manipulation functions
 */
import * as fs from 'fs';
import path, { join } from 'path';
import sharp from 'sharp';
import { Writable } from 'stream';
import os from 'os';
import * as fse from 'fs-extra';
import * as mime from 'mime-types';
import crypto from 'crypto';

const bytesToKbytes = (bytes) => Math.round((bytes / 1000) * 100) / 100;

function writableDiscardStream(options) {
  return new Writable({
    ...options,
    write(chunk, encding, callback) {
      setImmediate(callback);
    },
  });
}

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

const writeStreamToFile = (stream, path) =>
  new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(path);
    // Reject promise if there is an error with the provided stream
    stream.on('error', reject);
    stream.pipe(writeStream);
    writeStream.on('close', resolve);
    writeStream.on('error', reject);
  });

const getMetadata = (file): Promise<any> =>
  new Promise((resolve, reject) => {
    const pipeline = sharp();
    pipeline.metadata().then(resolve).catch(reject);
    file.getStream().pipe(pipeline);
  });

const getDimensions = async (file) => {
  const { width = null, height = null } = await getMetadata(file);
  return { width, height };
};

const THUMBNAIL_RESIZE_OPTIONS = {
  width: 245,
  height: 156,
  fit: 'inside',
};

const resizeFileTo = async (file, options, { name, hash }) => {
  const filePath = join(file.tmpWorkingDirectory, hash);

  await writeStreamToFile(
    file.getStream().pipe(sharp().resize(options)),
    filePath,
  );
  const newFile = {
    name,
    hash,
    ext: file.ext,
    mime: file.mime,
    path: file.path || null,
    getStream: () => fs.createReadStream(filePath),
  };

  const { width, height, size } = await getMetadata(newFile);

  Object.assign(newFile, { width, height, size: bytesToKbytes(size) });
  return newFile;
};

const generateThumbnail = async (file) => {
  if (
    file.width > THUMBNAIL_RESIZE_OPTIONS.width ||
    file.height > THUMBNAIL_RESIZE_OPTIONS.height
  ) {
    const newFile = await resizeFileTo(file, THUMBNAIL_RESIZE_OPTIONS, {
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
const optimize = async (file) => {
  const sizeOptimization = true; // TODO: check
  const autoOrientation = true; // TODO: check

  const newFile = { ...file };

  const { width, height, size, format } = await getMetadata(newFile);

  if (sizeOptimization || autoOrientation) {
    const transformer = sharp();
    // reduce image quality
    transformer[format]({ quality: sizeOptimization ? 80 : 100 });
    // rotate image based on EXIF data
    if (autoOrientation) {
      transformer.rotate();
    }
    const filePath = join(file.tmpWorkingDirectory, `optimized-${file.hash}`);

    await writeStreamToFile(file.getStream().pipe(transformer), filePath);

    newFile.getStream = () => fs.createReadStream(filePath);
  }

  const {
    width: newWidth,
    height: newHeight,
    size: newSize,
  } = await getMetadata(newFile);

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

const generateResponsiveFormats = async (file) => {
  const responsiveDimensions = true;

  if (!responsiveDimensions) return [];

  const originalDimensions = await getDimensions(file);

  return Promise.all(
    Object.keys(breakpoints).map((key) => {
      const breakpoint = breakpoints[key];

      if (breakpointSmallerThan(breakpoint, originalDimensions)) {
        return generateBreakpoint(key, {
          file,
          breakpoint,
        });
      }

      return undefined;
    }),
  );
};

const generateBreakpoint = async (key, { file, breakpoint }) => {
  const newFile = await resizeFileTo(
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

const breakpointSmallerThan = (breakpoint, { width, height }) => {
  return breakpoint < width || breakpoint < height;
};

/**
 *  Applies a simple image transformation to see if the image is faulty/corrupted.
 */
const isFaultyImage = (file) =>
  new Promise((resolve) => {
    file
      .getStream()
      .pipe(sharp().rotate())
      .on('error', () => resolve(true))
      .pipe(writableDiscardStream({}))
      .on('error', () => resolve(true))
      .on('close', () => resolve(false));
  });

const isOptimizableImage = async (file) => {
  let format;
  try {
    const metadata = await getMetadata(file);
    format = metadata.format;
  } catch (e) {
    // throw when the file is not a supported image
    return false;
  }
  return format && FORMATS_TO_OPTIMIZE.includes(format);
};

const isResizableImage = async (file) => {
  let format;
  try {
    const metadata = await getMetadata(file);
    format = metadata.format;
  } catch (e) {
    // throw when the file is not a supported image
    return false;
  }
  return format && FORMATS_TO_RESIZE.includes(format);
};

const isImage = async (file) => {
  let format;
  try {
    const metadata = await getMetadata(file);
    format = metadata.format;
  } catch (e) {
    // throw when the file is not a supported image
    return false;
  }
  return format && FORMATS_TO_PROCESS.includes(format);
};

const createAndAssignTmpWorkingDirectoryToFiles = async (files) => {
  // todo
  const tmpWorkingDirectory = await fse.mkdtemp(
    join(os.tmpdir(), 'strapi-upload-'),
  );

  if (Array.isArray(files)) {
    files.forEach((file) => {
      file.tmpWorkingDirectory = tmpWorkingDirectory;
    });
  } else {
    files.tmpWorkingDirectory = tmpWorkingDirectory;
  }

  return tmpWorkingDirectory;
};

const enhanceAndValidateFile = async (file, fileInfo = {}, metas = {}) => {
  const currentFile = await formatFileInfo(
    {
      filename: file.name,
      type: file.type,
      size: file.size,
    },
    fileInfo,
    {
      ...metas,
      tmpWorkingDirectory: file.tmpWorkingDirectory,
    },
  );

  currentFile.getStream = () => fs.createReadStream(file.path);

  if (await isImage(currentFile)) {
    if (await isFaultyImage(currentFile)) {
      throw new Error('File is not a valid image');
    }
    if (await isOptimizableImage(currentFile)) {
      return optimize(currentFile);
    }
  }
  return currentFile;
};

const formatFileInfo = async (
  { filename, type, size },
  fileInfo: any = {},
  metas: any = {},
) => {
  let ext = path.extname(filename);
  if (!ext) {
    ext = `.${mime.extension(type)}`;
  }
  const usedName = (fileInfo.name || filename).normalize();
  const basename = path.basename(usedName, ext);

  const entity: any = {
    name: usedName,
    alternativeText: fileInfo.alternativeText,
    caption: fileInfo.caption,
    folder: fileInfo.folder,
    folderPath: await getFolderPath(fileInfo.folder),
    hash: generateFileName(basename),
    ext,
    mime: type,
    size: bytesToKbytes(size),
  };

  const { refId, ref, field }: any = metas;

  if (refId && ref && field) {
    entity.related = [
      {
        id: refId,
        __type: ref,
        __pivot: { field },
      },
    ];
  }

  if (metas.path) {
    entity.path = metas.path;
  }

  if (metas.tmpWorkingDirectory) {
    entity.tmpWorkingDirectory = metas.tmpWorkingDirectory;
  }

  return entity;
};

const getFolderPath = async (folderId) => {
  if (!folderId) return '/';

  const parentFolder = { path: null };

  return parentFolder.path;
};

const generateFileName = (name) => {
  // const baseName = nameToSlug(name, { separator: '_', lowercase: false });

  return `ad_${randomSuffix()}`;
};

const randomSuffix = () => crypto.randomBytes(5).toString('hex');

module.exports = () => ({
  isFaultyImage,
  isOptimizableImage,
  isResizableImage,
  isImage,
  getDimensions,
  generateResponsiveFormats,
  generateThumbnail,
  optimize,
  createAndAssignTmpWorkingDirectoryToFiles,
  enhanceAndValidateFile,
});
