import mongoose  from 'mongoose'
import * as argon2 from  'argon2'


const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true,
        trim : true,
    },
    email : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true,
    },
    password : {
        type : String,
        required : true,
    },
},{timestamps : true})

userSchema.pre('save', async function(next) {
    if(this.isModified('password')) {
        try {
            this.password = await argon2.hash(this.password)
            
        } catch (error) {
            return next(error)       
        }
    }
})
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await argon2.verify(password, candidatePassword)
    } catch (error) {
        return false
    }
}

userSchema.index({
    username : 'text',
})

const User = mongoose.model('User', userSchema)

export default User