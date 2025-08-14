import jwt from 'jsonwebtoken';
import config from '../config';

interface ITokenPayload {
  id: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

export const generateToken = (payload: ITokenPayload) => {
  return jwt.sign(payload, config.JWT_SECRET!, {
    expiresIn: '7d',
  });
};
