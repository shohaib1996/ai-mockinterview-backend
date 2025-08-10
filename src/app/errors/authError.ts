import { ApiError } from './apiError';

export class AuthError extends ApiError {
  constructor(message: string) {
    super(401, message);
  }
}
