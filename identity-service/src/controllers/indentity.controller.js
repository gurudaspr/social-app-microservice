import User from "../models/user.model.js"
import { generateTokens } from "../utils/generateToken.js"
import logger from "../utils/logger.js"
import { validateRegistration} from '../utils/validation.js'

// user register

export const registerUser = async (req, res) => {
    logger.info('Registeration endpoint hit')
    try {
        const { error } = validateRegistration(req.body);
        if (error) {
          logger.warn("Validation error", error.details[0].message);
          return res.status(400).json({
            success: false,
            message: error.details[0].message,
          });
        }
        const {username,email,password} = req.body
        const user = await User.findOne({$or : [{username},{email}]})
        if(user) {
            logger.warn('User already exists')
            return res.status(400).json({
                success : false,
                message : error.details[0].message,
            })
        }
        const newUser = await User.create({
            username,
            email,
            password,
        })
        logger.warn('User  created successfully',newUser._id);

        const {accessToken,refreshToken} = await generateTokens(newUser)
        res.status(200).json({
            success : true,
            message : 'User created successfully',
            accessToken,
            refreshToken,
        })

        
    } catch (error) {
        logger.error("Registeration error occured",error)
        res.status(500).json({
            success : false,
            message : error.message,
        })
    }
}




//user login





//refresh token





//logout