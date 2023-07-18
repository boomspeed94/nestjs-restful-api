import * as _ from 'lodash';
import { HttpException, HttpStatus } from '@nestjs/common';

export const ErrorCodes = {
  unauthorized: `100::unauthorized: <%= message %>`,
  forbidden: '101::forbidden',
  emailAlreadyTaken: '1000::email already taken',
  passwordLength: '1001::password too short (< 6 chars)',
  usernameLength: '1002::username too short (< 6 chars)',
  filesEmpty: '1003::files are empty',
  uploadFailed: '1004::upload failed: <%= message %>',
};

export interface ErrorOptions {
  message?: string;
}

const httpError = (msg, status: HttpStatus) => {
  throw new HttpException(msg, status);
};

const buildMessage = (template, options: ErrorOptions = null) => {
  let msg = template;
  if (options) {
    const compiled = _.template(template);
    if (options.message) msg = compiled({ message: options.message });
  }
  return msg;
};

export const badRequest = (strCode: string, options: ErrorOptions = null) => {
  return httpError(buildMessage(strCode, options), HttpStatus.BAD_REQUEST);
};

export const unauthorized = (strCode: string, options: ErrorOptions = null) => {
  return httpError(buildMessage(strCode, options), HttpStatus.UNAUTHORIZED);
};

export const forbidden = (strCode: string, options: ErrorOptions = null) => {
  return httpError(buildMessage(strCode, options), HttpStatus.FORBIDDEN);
};

export const notFound = (strCode: string, options: ErrorOptions = null) => {
  return httpError(buildMessage(strCode, options), HttpStatus.NOT_FOUND);
};

export const methodNotAllow = (
  strCode: string,
  options: ErrorOptions = null,
) => {
  return httpError(
    buildMessage(strCode, options),
    HttpStatus.METHOD_NOT_ALLOWED,
  );
};

export const internalServerError = (
  strCode: string,
  options: ErrorOptions = null,
) => {
  return httpError(
    buildMessage(strCode, options),
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
};

export const badGateway = (strCode: string, options: ErrorOptions = null) => {
  return httpError(buildMessage(strCode, options), HttpStatus.BAD_GATEWAY);
};
