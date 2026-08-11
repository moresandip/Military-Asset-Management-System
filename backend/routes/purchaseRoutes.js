import express from 'express';
import { getPurchases, createPurchase } from '../controllers/purchaseController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', enforceBaseScope, getPurchases);
router.post('/', authorizeRoles('ADMIN', 'LOGISTICS_OFFICER'), createPurchase);

export default router;
