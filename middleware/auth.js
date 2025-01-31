const User = require('../models/User')
const jwt = require('jsonwebtoken')
const CustomError = require('../errors/customError')

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        throw new CustomError('Invalid bearer token')
    }
    const token = authHeader.split(' ')[1]
    
    try{
        const payload = jwt.verify(token, process.env.JWT_KEY)
        //attaches user to note routes
        req.user = { userId: payload.userId,
            username: payload.username,
            email:payload.email
        }
        next()
    }
    catch(error){
        throw new CustomError('Authentication invalid')
    }
}

module.exports = auth

