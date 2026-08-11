import express from 'express';
import { login, getMe, getAllUsers } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.get('/users', authenticateToken, authorizeRoles('ADMIN'), getAllUsers);

export default router;
