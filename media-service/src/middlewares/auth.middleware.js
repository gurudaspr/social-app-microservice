import logger from "../utils/logger.js";

 const authenticateRequest = (req, res, next) => { 
    const  userId = req.headers['x-user-id'];

    if(!userId){
        logger.warn(`Access attempt without user id`);
        return res.status(401).json({success: false, message: 'Authentication required ,please login to continue'});
    }
    req.user = {userId};
    next();
}
export default authenticateRequest;