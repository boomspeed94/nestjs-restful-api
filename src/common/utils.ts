import { customAlphabet } from 'nanoid';

export const generateId = (): string => {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nanoid = customAlphabet(chars, 16);
  return nanoid();
};
