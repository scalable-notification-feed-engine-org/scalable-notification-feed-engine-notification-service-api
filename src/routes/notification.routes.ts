import { Router } from 'express';
import {getNotifications, markAsAll, markAsRead} from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getNotifications);

router.patch('/:id/read', authenticate, markAsRead);

router.patch('/read-all', authenticate, markAsAll);

export default router;