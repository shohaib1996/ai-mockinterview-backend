import express from 'express';
import auth from '@/app/middlewares/auth';
import { Role } from '@prisma/client';
import { ContentPoolController } from './contentPool.controller';

const router = express.Router();

router.get('/', auth([Role.ADMIN]), ContentPoolController.getPoolStatus);
router.post('/generate', auth([Role.ADMIN]), ContentPoolController.generateNow);

export const ContentPoolRoutes = router;
