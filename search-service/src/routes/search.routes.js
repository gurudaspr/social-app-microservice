import express from 'express';
import authenticateRequest from '../middlewares/auth.middleware.js';
import { searchPost } from '../controllers/search.controller.js';


const router = express.Router();

router.use(authenticateRequest);

router.get('/posts', searchPost)

export default router;