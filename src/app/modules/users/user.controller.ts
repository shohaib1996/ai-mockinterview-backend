import { Request, Response } from 'express';

import { UserServices } from './user.services';
import httpStatus from 'http-status';
import catchAsync from '@/app/utils/catchAsync';
import { User } from '@prisma/client';

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

const getAllUsersController = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, id, name, email } = req.query;
  const options: { page?: number; limit?: number; id?: string; name?: string; email?: string } = {};

  if (page) options.page = Number(page);
  if (limit) options.limit = Number(limit);
  if (id) options.id = id as string;
  if (name) options.name = name as string;
  if (email) options.email = email as string;

  const result = await UserServices.getAllUsers(options);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Users retrieved successfully',
    ...result,
  });
});

const changeUserRoleController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!id) {
    return;
  }

  const result = await UserServices.changeUserRole(id, role);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'User role updated successfully',
    data: result,
  });
});

const getProfileController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user as User;

  const result = await UserServices.getProfile(id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

const editProfileController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user as User;
  const result = await UserServices.editProfile(id, req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const resetPasswordController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user as User;
  const { oldPassword, newPassword } = req.body;

  await UserServices.resetPassword(id, oldPassword, newPassword);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Password reset successfully',
  });
});

export const UserController = {
  createUserController,
  loginUserController,
  getAllUsersController,
  changeUserRoleController,
  getProfileController,
  editProfileController,
  resetPasswordController,
};
