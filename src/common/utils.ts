import { customAlphabet } from 'nanoid';
import slugify from 'slugify';
import * as multer from 'multer';
import * as process from 'process';
import * as path from 'path';
import * as fse from 'fs-extra';
import * as fs from 'fs';

export const generateId = (): string => {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nanoid = customAlphabet(chars, 16);
  return nanoid();
};

/**
 * The list of models in system
 * The model name have to match with Model name in prisma schema file (./prisma/schema.prisma)
 */
export const modelNames = {
  User: 'User',
  File: 'File',
  Media: 'Media',
};

/**
 * The List of models doesn't audit (createAt, updateAt, deleteAt...)
 * Note: Model Name have to match with Prisma schema name (./prisma/schema.prisma)
 */
export const unAuditModels = ['Media'];

export const nameToSlug = (
  name,
  options?: { lower?: boolean; replacement?: string },
) => slugify(name, options);

export const uploadPath = () => {
  const dataDir = process.env.DATA_PATH || __dirname;
  const uploadDir = dataDir + '/upload';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  return uploadDir;
};

export const tmpPath = () => {
  const dataDir = process.env.DATA_PATH || __dirname;
  const uploadDir = dataDir + '/tmp';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  return uploadDir;
};

/**
 * File upload storage configuration
 */
export const fileStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const tmpWorkingDirectory = await fse.mkdtemp(
      path.join(tmpPath(), 'files-'),
    );
    cb(null, tmpWorkingDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, `/${file.originalname}`);
  },
});