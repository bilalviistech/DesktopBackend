import mongoose from 'mongoose'
import User from '../Models/User.js'
import bcrypt from 'bcrypt'
import Jwt from 'jsonwebtoken'

class AdminController {
    static async Register(req, res) {
        const { email, password, name, role } = req.body

        // Accessing specific files
        const profilePic = req.files['profilePic'] ? req.files['profilePic'][0].filename : null;
        const coverPic = req.files['coverPic'] ? req.files['coverPic'][0].filename : null;

        try {
            const existingUser = await User.findOne({ email: email })
            if (existingUser) {
                res.status(200).json({
                    success: "false",
                    message: "Email Already Exists."
                })
            }
            else {
                const salt = await bcrypt.genSalt(10)
                const hash = await bcrypt.hash(password, salt)

                const newUser = new User({
                    _id: new mongoose.Types.ObjectId(),
                    name: name,
                    email: email,
                    password: hash,
                    role: role,
                    profilePic: profilePic,
                    coverPic: coverPic,
                })
                await newUser.save()

                res.status(200).json({
                    success: "true",
                    message: "User Created"
                })
            }
        } catch (err) {
            console.error(err)
            res.status(200).json({
                success: false,
                message: err.message
            })
        }
    }
    static async Login(req, res) {
        const { email, password } = req.body
        const UserExist = await User.findOne({ email: email })
        if (UserExist) {
            bcrypt.compare(password, UserExist.password, (err, result) => {
                if (result) {
                    const token = Jwt.sign({
                        id: UserExist._id,
                        name: UserExist.name,
                        email: UserExist.email,
                        role: UserExist.role,
                    },
                        process.env.AppToken
                    )
                    return res.status(200).json({
                        success: true,
                        PofilePath: `${process.env.APP_URL}${process.env.PROFILES_LINK}`,
                        data: {
                            id: UserExist.id,
                            name: UserExist.name,
                            email: UserExist.email,
                            profilePic: UserExist.profilePic,
                            coverPic: UserExist.coverPic,
                            role: UserExist.role,
                            token: token
                        }
                    })
                }
                else {
                    res.status(200).json({
                        success: false,
                        message: "Password Doesn't Match"
                    })
                }
            })
        }

        else {
            res.status(200).json({
                success: false,
                message: "Email doesn't exist."
            })
        }
    }
}

export default AdminController