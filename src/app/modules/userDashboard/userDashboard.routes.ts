import { Router } from 'express';
import auth from '../../middlewares/auth';
import { UserDashboardController } from './userDashboard.controller';
import { Role } from '@prisma/client';

const router = Router();

router.get('/user', auth([Role.USER, Role.ADMIN]), UserDashboardController.getUserDashboardData);

export const UserDashboardRoutes = router;
