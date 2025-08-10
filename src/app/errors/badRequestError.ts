import { ApiError } from './apiError';

export class BadRequestError extends ApiError {
  constructor(message: string) {
    super(400, message);
  }
}
