import Media from "../models/media.model.js";
import { deleteMediaFromCloudinary } from "../utils/cloudinary.js";
import logger from "../utils/logger.js";


export const handlePostDeleted = async (event) => {
    console.log('Post deleted event received',event);
    const { postId, mediaIds } = event;
    try{
        const mediaToDelete = await Media.find({ _id: { $in: mediaIds } });
        for (const media of mediaToDelete) {
            await deleteMediaFromCloudinary(media.publicId);
            await Media.findByIdAndDelete(media._id);
            logger.info(`Deleted media with id ${media._id} associated with post ${postId}`);
        }

        logger.info(`Processed delete event for post ${postId}`);

    }
    catch(error){
        logger.error('Error handling post deleted event',error);
    }
    
}

