import { Request, Response } from 'express';
import catchAsync from '@/app/utils/catchAsync';
import { UserDashboardService } from './userDashboard.services';
import { IUser } from '../users/users.interface';

const getUserDashboardData = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const result = await UserDashboardService.getUserDashboardData(user.id);

  res.status(200).json({
    success: true,
    message: 'User dashboard data retrieved successfully',
    data: result,
  });
});

export const UserDashboardController = {
  getUserDashboardData,
};
