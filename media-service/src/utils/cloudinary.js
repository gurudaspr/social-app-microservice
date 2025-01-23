import cloudinary from 'cloudinary';
import logger from './logger.js';

cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,

    
});

const uploadMediaToCloudinary = async (file) => {
    return  new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream({resource_type: 'auto' ,folder :'social-media'}, (error, result) => {
            if(error){
                logger.error('Error while uploading file to cloudinary', error);
                reject(error);
            }
            resolve(result);
        })
        uploadStream.end(file.buffer);  
    }
    );
};

const deleteMediaFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.v2.uploader.destroy(publicId);
        logger.info('Deleted file from cloudinary', publicId);
        return result;
        
    } catch (error) {
        logger.error('Error while deleting file from cloudinary', error);
        throw error;
        
    }
}

export {uploadMediaToCloudinary, deleteMediaFromCloudinary};
