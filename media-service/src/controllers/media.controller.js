import Media from "../models/media.model.js";
import { uploadMediaToCloudinary } from "../utils/cloudinary.js";
import logger from "../utils/logger.js"


export const uploadMedia = async (req, res) => {

    logger.info('Starting media upload');
    try {
        if (!req.file) {
            logger.error('No file found. Please add a file to upload');
            return res.status(400).json({ success: false, message: 'No file found. Please add a file to upload' })
        }
        const { originalname, mimetype, buffer } = req.file;
        const userId = req.user.userId;
        logger.info(`File details: name=${originalname}, type=${mimetype}`);
        logger.info('Uploading to cloudinary.....');

        const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);
        logger.info(`Cloudnianry upload succesfull. Public Id: ${cloudinaryUploadResult.public_id}`);

        const newMedia = new Media({
            userId,
            originalName:originalname,
            mimeType : mimetype,
            publicId: cloudinaryUploadResult.public_id,
            url: cloudinaryUploadResult.secure_url,
        });
        await newMedia.save();
        res.status(201).json({
            success: true,
            mediaId: newMedia._id,
            url: newMedia.url,
            message: 'Media uploaded successfully',
        });


    }catch (error) {
        logger.error("Media upload error occured",error)
        res.status(500).json({
            success : false,
            message : error.message,
        })
    }
}

export const getAllMedias = async (req, res) => {
    try {
        const medias = await Media.find({})
        res.status(200).json({
            success: true,
            data: medias,
        });
    } catch (error) {
        logger.error('Error getting media', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}