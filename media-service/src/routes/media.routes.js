import express from 'express';
import multer from 'multer';
import authenticateRequest from '../middlewares/auth.middleware.js';
import logger from '../utils/logger.js';
import { getAllMedias, uploadMedia } from '../controllers/media.controller.js';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, //5mb
    },
}).single('file');

router.post('/upload', authenticateRequest, (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            logger.error('Multer Error uploading file', err);
            return res.status(500).json({
                success: false,
                message: 'Multer Error uploading file',
                error: err.message,
                stack: err.stack,

            });
        } else if (err) {
            logger.error('Unknow error uploading file', err);
            return res.status(500).json({
                success: false,
                message: 'Unknow error uploading file',
                error: err.message,
                stack: err.stack,
            });
        }

        if (!req.file) {
            logger.error('No file found. Please add a file to upload');
            return res.status(400).json({ success: false, message: 'No file found. Please add a file to upload' })
        }
        next()
    });
}, uploadMedia);


router.get('/get-media', authenticateRequest, getAllMedias);
export default router;





