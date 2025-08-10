import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../errors/notFoundError';

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Not Found - ${req.originalUrl}`);
  next(error);
};

export default notFound;
