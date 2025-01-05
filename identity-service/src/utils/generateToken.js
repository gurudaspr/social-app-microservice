import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import RefreshToken from '../models/refreshToken.model.js';

export const generateTokens = async(user) => {
    const accessToken =  jwt.sign({
       userId : user._id,
       username : user.username,
    },process.env.JWT_SECRET,{
        expiresIn : '60m',
    })

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now());
    expiresAt.setDate(expiresAt.getDate() + 7); // refresh token expires in 7 days
    await RefreshToken.create({
        token : refreshToken,
        user : user._id,
        expiresAt
    })
    return {
        accessToken,
        refreshToken,
    }
}
