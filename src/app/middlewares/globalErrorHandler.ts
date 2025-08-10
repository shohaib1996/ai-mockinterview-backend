import { Request, Response } from 'express';
import { ApiError } from '../errors/apiError';
import { AuthError } from '../errors/authError';
import { NotFoundError } from '../errors/notFoundError';
import { BadRequestError } from '../errors/badRequestError';

const globalErrorHandler = (err: Error, req: Request, res: Response) => {
  let statusCode = 500;
  let message = 'Something went wrong!';

  if (err instanceof AuthError || err instanceof NotFoundError || err instanceof BadRequestError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export default globalErrorHandler;
