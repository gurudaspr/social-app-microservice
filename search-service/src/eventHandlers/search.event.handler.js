import Search from "../models/search.model.js";
import logger from "../utils/logger.js"


export const handlePostCreated = async (event) => {
    try {     
        const newSearch =new Search({
            postId: event.postId,
            userId: event.userId,
            content: event.content,
            createdAt: event.createdAt
        })
        await newSearch.save();
        logger.info(`Search created successfully : ${event.postId} , ${newSearch._id.toString()}  `);

    } catch (error) {
        logger.error('Error handling post created event', error);

    }
}

export const handlePostDeleted = async (event) => {
    try {  
        
        await Search.findOneAndDelete({postId: event.postId});
        logger.info(`Search deleted successfully : ${event.postId} `);
        

    } catch (error) {
        logger.error('Error handling post delete event', error);

    }
}