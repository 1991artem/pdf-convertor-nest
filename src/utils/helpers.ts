import { BinaryLike, createHmac } from 'crypto';
import { config } from '../config';

export const hashPassword = (password: string) => {
  const hasher = createHmac('sha256', config.APP.PASSWORD_SECRET as BinaryLike);
  return hasher.update(`${password}`).digest('hex');
};
