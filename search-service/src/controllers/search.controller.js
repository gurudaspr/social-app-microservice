import Search from "../models/search.model.js";
import logger from "../utils/logger.js"




export const searchPost = async (req, res) => {
    logger.info('Searching endpoint hit');
    try {
        const { query } = req.query;

        const results = await Search.find(
            {
                $text: { $search: query }
            },
            { score: { $meta: 'textScore' } }
        ).sort({ score: { $meta: 'textScore' } }).limit(10);

        res.status(200).json({ success: true, results });


    } catch (error) {
        logger.error('Error while searching post', error);
        res.status(500).json({ success: false, message: 'Error while searching post' });

    }

}