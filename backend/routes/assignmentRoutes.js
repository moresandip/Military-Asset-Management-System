import express from 'express';
import { 
  getAssignments, 
  createAssignment, 
  returnAssignment, 
  getExpenditures, 
  createExpenditure 
} from '../controllers/assignmentController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/assignments', enforceBaseScope, getAssignments);
router.post('/assignments', authorizeRoles('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'), enforceBaseScope, createAssignment);
router.patch('/assignments/:id/return', authorizeRoles('ADMIN', 'BASE_COMMANDER'), returnAssignment);

router.get('/expenditures', enforceBaseScope, getExpenditures);
router.post('/expenditures', authorizeRoles('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'), enforceBaseScope, createExpenditure);

export default router;
