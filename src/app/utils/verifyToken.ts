import jwt from 'jsonwebtoken';
import config from '../config';

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.JWT_SECRET!);
};
