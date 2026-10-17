import express from 'express';
import { uploadPhotos } from '../controllers/uploadController.js';
import { upload } from '../middleware/upload.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', optionalAuth, upload.array('photos', 4), uploadPhotos);

export default router;
