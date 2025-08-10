import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/verifyToken';
import { JwtPayload } from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';
import { AuthError } from '../errors/authError';

const auth = (roles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new AuthError('Unauthorized');
      }

      const decoded = verifyToken(token) as JwtPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new AuthError('Unauthorized');
      }

      if (!roles.includes(user.role)) {
        throw new AuthError('Forbidden');
      }

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
