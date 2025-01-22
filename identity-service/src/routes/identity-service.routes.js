import express from 'express'
import {loginUser, logoutUser, refreshTokenUser, registerUser} from '../controllers/indentity.controller.js'



const router = express.Router()

router.post('/register',registerUser)
router.post('/login',loginUser)
router.post('/refresh-token',refreshTokenUser)
router.get('/logout',logoutUser)

export default router