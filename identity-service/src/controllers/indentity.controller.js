import RefreshToken from "../models/refreshToken.model.js"
import User from "../models/user.model.js"
import { generateTokens } from "../utils/generateToken.js"
import logger from "../utils/logger.js"
import { validatelogin, validateRegistration} from '../utils/validation.js'

// user register

export const registerUser = async (req, res) => {
    logger.info('Registeration endpoint hit')
    try {
        const { error } = validateRegistration(req.body)     
        if (error) {
          logger.warn("Validation error", error.details[0].message);
          return res.status(400).json({
            success: false,
            message: error.details[0].message,
          });
        }
        const {username,email,password} = req.body
        const user = await User.findOne({$or : [{username},{email}]})
        if (user) {
            logger.warn("User already exists");
            return res.status(400).json({
              success: false,
              message: "User already exists",
            });
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

export const loginUser = async (req, res) => {
    logger.info('Login endpoint hit')
    try {
        const { error } = validatelogin(req.body);
        if (error) {
          logger.warn("Validation error", error.details[0].message);
          return res.status(400).json({
            success: false,
            message: error.details[0].message,
          });
        }
        const {email,password} = req.body
        const user = await User.findOne({ 
            email,
        })
        if(!user) {
            logger.warn('Invalid User')
            return res.status(400).json({
                success : false,
                message : 'Invalid User',
            })
        }
        // check password

        const isValidPassword = await user.comparePassword(password)
        console.log(isValidPassword);
        
        if(!isValidPassword) {
            logger.warn('Invalid Credentials')
            return res.status(400).json({
                success : false,
                message : 'Invalid Credentials',
            })
        }

        const {accessToken,refreshToken} = await generateTokens(user)
        res.status(200).json({
            success : true,
            message : 'User logged in successfully',
            accessToken,
            refreshToken,
            userId : user._id,
        })

    } catch (error) {
        logger.error("Login error occured",error)
        res.status(500).json({
            success : false,
            message : error.message,
        })
    }
}




//refresh token

export const refreshTokenUser = async (req, res) => {
    logger.info('Refresh token endpoint hit')
    try {
        const {refreshToken} = req.body
        if(!refreshToken) {
            logger.warn('Refresh token is required')
            return res.status(400).json({
                success : false,
                message : 'Refresh token is required',
            })
        }
        const  storedToken  = await RefreshToken.findOne({token : refreshToken})
        if(!storedToken || storedToken.expiresAt < new Date()) {
            logger.warn('Invalid or expired refresh token')
            return res.status(401).json({
                success : false,
                message : 'Invalid or expired refresh toke',
            })
        }
        const user =  await User.findById(storedToken.user)
        if(!user) {
            logger.warn('User not found')
            return res.status(404).json({
                success : false,
                message : 'User not found',
            })
        }
        const {accessToken : newAccessToken ,refreshToken : newRefreshToken} = await generateTokens(user)

        // delete old refresh token
        await RefreshToken.deleteOne({id : storedToken._id})
        res.json({
            accessToken : newAccessToken,
            refreshToken : newRefreshToken,
        })

    } catch (error) {
        logger.error("Refresh token error occured",error)
        res.status(500).json({
            success : false,
            message : error.message,
        })
    }
}





//logout

export const logoutUser = async (req, res) => {
    logger.info('Logout endpoint hit')
    try {
        const {refreshToken} = req.body
        if(!refreshToken) {
            logger.warn('Refresh token is required')
            return res.status(400).json({
                success : false,
                message : 'Refresh token is required',
            })
        }
        await RefreshToken.deleteOne({token : refreshToken})
        logger.info('Refresh token deleted successfully')
        res.status(200).json({
            success : true,
            message : 'Logged out successfully',
        })


    } catch (error) {
        logger.error("Logout error occured",error)
        res.status(500).json({
            success : false,
            message : error.message,
        })
    }
}