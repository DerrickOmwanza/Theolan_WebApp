import express from 'express';
import ContactController from '../controllers/contactController.js';

const router = express.Router();

router.post('/', ContactController.createContact);

export { router as contactRoutes };
export default router;
