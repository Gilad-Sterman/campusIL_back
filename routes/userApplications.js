import express from 'express';
import userApplicationsController from '../controllers/userApplications.controller.js';
import { authenticateUser } from '../middleware/auth.js';
import { validateUUID } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', userApplicationsController.list.bind(userApplicationsController));
router.post('/', userApplicationsController.create.bind(userApplicationsController));
router.patch(
  '/:id',
  validateUUID('id'),
  userApplicationsController.patch.bind(userApplicationsController)
);

export default router;
