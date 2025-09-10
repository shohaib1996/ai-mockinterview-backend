import express from 'express';
import { AdminDashboardController } from './adminDashboard.controller';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.get('/', auth([Role.ADMIN]), AdminDashboardController.getAdminDashboardData);

export const AdminDashboardRoutes = router;
