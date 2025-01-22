import logger from "../utils/logger.js";
import jwt from 'jsonwebtoken';



const validateToken = (req , res , next) => {
    const authheader = req.headers['authorization'];
    const token = authheader && authheader.split(' ')[1];
    if(!token){
        logger.warn('Access attempt without valid token');
        return res.status(401).json({message: "Authentication required" ,success: false});
    }
    jwt.verify(token , process.env.JWT_SECRET , (err , user) => {
        if(err){
            logger.warn('Invalid token');
            return res.status(403).json({message: "Invalid token" , success: false});
        }
        req.user = user;
        next();
    });
}
export default validateToken;