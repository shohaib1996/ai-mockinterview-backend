import { Request, Response } from 'express';

import { UserServices } from './user.services';
import httpStatus from 'http-status';
import catchAsync from '@/app/utils/catchAsync';

const createUserController = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createUser(req.body);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'User created successfully',
    data: result,
  });
});

const loginUserController = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.loginUser(req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'User logged in successfully',
    data: result,
  });
});

export const UserController = {
  createUserController,
  loginUserController,
};
