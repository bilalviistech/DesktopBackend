import jwt from 'jsonwebtoken'
import User from '../Models/User.js'
import dotenv from 'dotenv'
dotenv.config()

var CheckUserAuth = async (req, res, next) => {
    let token
    const { authorization } = req.headers

    if (authorization && authorization.startsWith('Bearer')) {
        try {
            token = authorization.split(' ')[1]
            const DecodedToken = jwt.verify(token, process.env.AppToken)
            const id = DecodedToken.id
            req.user = await User.findById(id).select('-password')
            req.token = token
            next()
        } catch (error) {
            console.log("error")
            res.status(200).json({
                success: false,
                message: error.message
            })
        }
    }
    if (!token) {
        res.status(200).json({
            success: false,
            message: "Un Authorized Access"
        })
    }
}

export default CheckUserAuth