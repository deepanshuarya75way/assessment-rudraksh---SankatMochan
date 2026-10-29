import {Router} from 'express';
import auth from "../middleware/authMiddleware.js";
import {list,markRead,markAllRead} from '../controllers/notificationController.js';

const router = Router();
router.use(auth);
router.get('/',list);
router.patch('/read-all',markAllRead);
router.patch('/:id/read',markRead);

export default router;