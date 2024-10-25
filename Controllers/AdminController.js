import mongoose from 'mongoose'
import User from '../Models/User.js'
import OTP from '../Models/Otp.js'
import bcrypt from 'bcrypt'
import Jwt from 'jsonwebtoken'
// Importing modules
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

import htmlToPdf from 'html-to-pdf'
import pdf from 'html-pdf'
import { fileURLToPath } from 'url';
// import htmlToPdffrom 'html-to-pdf'
class AdminController {
    static async Register(req, res) {
        const { email, password, name, role, phoneNumber } = req.body

        // Accessing specific files
        const profilePic = req.files['profilePic'] ? req.files['profilePic'][0].filename : null;
        const coverPic = req.files['coverPic'] ? req.files['coverPic'][0].filename : null;

        try {
            const existingUser = await User.findOne({ email: email })
            if (existingUser) {
                res.status(200).json({
                    success: "false",
                    message: "Email already exists."
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
                    phoneNumber: phoneNumber
                })
                await newUser.save()

                res.status(200).json({
                    success: "true",
                    message: "User has been registered."
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
        const { email, password, role } = req.body
        console.log("...............................",email, password, role, )

        // return
        const UserExist = await User.findOne({ email: email, role: role })

        if (UserExist) {
            bcrypt.compare(password, UserExist.password, (err, result) => {
                if (result) {
                    const token = Jwt.sign({
                        id: UserExist._id,
                        name: UserExist.name,
                        email: UserExist.email,
                        bio: UserExist.bio,
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
                        },
                        token: token
                    })
                }
                else {
                    res.status(200).json({
                        success: false,
                        message: "Password doesn't match."
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

    static async GetAllUser(req, res) {

        const UserData = req.user
        try {
            const GetAllUser = await User.find({_id: {$ne: UserData._id}})
            
            res.status(200).json({
                success: true,
                data: GetAllUser
            })
        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message
            })
        }
    }

    static async EditProfile(req, res) {
        
        const { name, bio } = req.body
        const profilePic = req.file ? req.file.filename : ""
        console.log(req.file )
        // return

        try {
            const UserData = req.user
            UserData.name = (name ? name : UserData.name)
            UserData.bio = (bio ? bio : UserData.bio)
            UserData.profilePic = (profilePic ? profilePic : UserData.profilePic)
            await UserData.save()

            res.status(200).json({
                success: true,
                message: "Profile has been updated.",
                data: UserData,
                token: req.token
            })

        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message
            })
        }
    }

    static async DeletePic(req, res){
        try {
            const UserData = req.user
            UserData.profilePic = ""
            await UserData.save()
    
            res.status(200).json({
                success: true,
                message: "Profile picture has been deleted.",
                data: UserData,
                token: req.token
            })
        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message
            })
        }
    }

    static async ChangePasword(req, res){
        const { oldPassword, newPassword } = req.body 
        const UserDataId = req.user._id
        
        const UserInfo = await User.findById(UserDataId)
        if(UserInfo){
            bcrypt.compare(oldPassword, UserInfo.password, async (err, result) => {
                if (result) {
                    const salt = await bcrypt.genSalt(10)
                    const hash = await bcrypt.hash(newPassword, salt)
    
                    UserInfo.password = hash
                    await UserInfo.save()
    
                    return res.status(200).json({
                        success: true,
                        message: "Password has been changed."
                    })
                }
                else {
                    res.status(200).json({
                        success: false,
                        message: "Password doesn't match."
                    })
                }
            })
        }
        else{
            res.status(200).json({
                success: false,
                message: "User doesn't exist."
            })
        }
        
    }

    // User Verification Code Sent To Email
    static ForgetPassword = async (req, res) => {

        const { email } = req.body;
        if (email) {
            const userExist = await User.findOne({ email: email })
            if (userExist) {
                const otp = Math.floor(1000 + Math.random() * 9000);
                // Store the OTP in the database
                const otpData = new OTP({
                    _id: new mongoose.Types.ObjectId(),
                    userId: userExist._id,
                    otpCode: otp,
                });
                await otpData.save();

                // Send the OTP via email
                // const transporter = nodemailer.createTransport({
                //     service: 'Gmail',
                //     auth: {
                //         user: 'gmail@gmail.com',
                //         pass: '123456789',
                //     },
                // });
                // const mailOptions = {
                //     from: 'gmail@gmail.com',
                //     to: email,
                //     subject: 'OTP Code Of Password',
                //     text: `Your OTP For Password Reset Is: ${otp}`,
                // };
                // transporter.sendMail(mailOptions, (error, info) => {
                //     if (error) {
                //         res.status(200).json({
                //             success: false,
                //             message: error.message
                //         });
                //     } else {
                        res.status(200).json({
                            success: true,
                            message: `OTP Sent Successfully ${otp}.`,
                            id: userExist._id,
                            OTP: otp
                        });
                //     }
                // });

            } else {
                res.status(200).json({
                    success: false,
                    message: "Email doesn't exist."
                })
            }
        }
        else {
            res.status(200).json({
                success: false,
                message: "Email must be required."
            })
        }
    }

    static ForgetPasswordCodeVerify = async (req, res) => {
        try {
            const code = req.params.code
            const userId = req.params.userId

            if (!code) {
                return res.status(200).json({
                    success: false,
                    message: "Code must be filled."
                })
            }
            const codeVerified = await OTP.findOne({ otpCode: code, userId: userId })

            if (!codeVerified) {
                return res.status(200).json({
                    success: false,
                    message: "Code doesn't verified."
                })
            }
            res.status(200).json({
                success: true,
                message: "Code has been verified."
            })

        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message
            })
        }
    }

    static ForgetChangePassword = async (req, res) => {
        try {
            const {id, password} = req.body

            if (!id || !password) {
                return res.status(200).json({
                    success: false,
                    message: "Filled all fields."
                })
            }

            const salt = await bcrypt.genSalt(10)
            const HashPassword = await bcrypt.hash(password, salt)

            const codeVerified = await User.findOneAndUpdate({_id: id},{
                $set: {
                    password: HashPassword
                }
            }, {new: true})

            res.status(200).json({
                success: true,
                message: "Password has been changed successfuly.",
                data: codeVerified
            })

        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message
            })
        }
    }


    // Create a document
    // const doc = new PDFDocument();

    // // Saving the pdf file in root directory.
    // doc.pipe(fs.createWriteStream('example.pdf'));
    // // Adding functionality
    // doc
    // .fontSize(27)
    // .text('This the article for GeeksforGeeks', 100, 100);

    // // Finalize PDF file
    // doc.end();

    // res.send("ok")


    // const pfp = 'path/to/profile-image.jpg'; // Path to the profile image

    static async generatePDF(req, res) {

        const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

        const html = `
    <div style="width: 100%; margin: 30px auto;">
        <table width="100%" cellpadding="0" cellspacing="0">
            <thead>
                <tr>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td data-title="Name">
                        <div style="display: table; margin: 0 auto; width: 100%;">
                            <p style="font-size: 28px; line-height: 30px;font-weight: 1000;">PRE MEDICAL RECORDS INTERVIEW COMPLETED.</p>
                            <hr>
                            <div style="display: table; margin: 0 auto; width: 100%;">
                                <p style="display: inline-block; margin: 0 auto; width: 20%;font-size:14px;"><span style="font-weight: 1000;">Caller</span> Kimberly Wetch</p>
                                <p style="display: inline-block; margin: 0 auto; width: 20%;font-size:14px;"><span style="font-weight: 1000;">Firm</span> Kimberly Wetch</p>
                                <p style="display: inline-block; margin: 0 auto; width: 20%;font-size:14px;"><span style="font-weight: 1000;">Evaluated By</span> Med View Services</p>
                                <p style="display: inline-block; margin: 0 auto; width: 16%;font-size:14px;"><span style="font-weight: 1000;">Date</span> Aug 21, 2024</p>
                                <p style="display: inline-block; margin: 0 auto; width: 24%;font-size:14px;"><span style="font-weight: 1000;">Meet Medical Requirements</span> Yes</p>
                            </div>
                            
                            <p style="font-weight: 700;padding-top: 10px;font-size: 25px;">Evaluation Synopsis: </p>
                            <ol style="padding-inline-start: 18px;margin-top: 36px;">
                                <li style="font-size: 16px; margin-bottom: 20px;">
                                    <div style="color: #020a02; font-weight: 600;width: 19%;">Resulting Damage : </div>
                                    <div style="width: 81%;margin-left: 19%;margin-top: -20px;">my text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more rec</div>
                                </li>
                                <li style="font-size: 16px; margin-bottom: 20px;">
                                    <div style="color: #020a02; font-weight: 600;width: 20%;">Alleged Negligence : </div>
                                    <div style="width: 80%;margin-left: 20%;margin-top: -20px;">my text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recenctly with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</div>
                                </li>
                                <li style="font-size: 16px; margin-bottom: 20px;">
                                    <div style="color: #020a02; font-weight: 600;width: 19%;">Further Treatment : </div>
                                    <div style="width: 81%;margin-left: 19%;margin-top: -20px;">my text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recenctly with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</div>
                                </li>
                                <li style="font-size: 16px; margin-bottom: 20px;">
                                    <div style="color: #020a02; font-weight: 600;width: 26%;">Relevant Medical History : </div>
                                    <div style="width: 74%;margin-left: 26%;margin-top: -20px;">my text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recenctly with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</div>
                                </li>
                                <li style="font-size: 16px; margin-bottom: 20px;">
                                    <div style="color: #020a02; font-weight: 600;width: 18%;">Reviewers Notes : </div>
                                    <div style="width: 82%;margin-left: 18%;margin-top: -20px;">my text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recenctly with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</div>
                                </li>
                            </ol>
                        </div>
                    </td>
                </tr>

                <tr>
                    <td data-title="Name">
                        <div style="display: table; margin: 0 auto; width: 100%;">
                            
                            <p style="font-weight: 700;padding-top: 10px;font-size: 25px;">Injured Info: </p>
                            <div style="display: inline;padding-right: 5px;">
                                <p style="display: inline;">
                                    <span style="border: 1px solid rgb(243, 247, 210);border-radius:50%;padding: 6px 3px;padding-left: 13px;text-align: center;background-color: red;">
                                        1.
                                    </span>
                                    <span style="color: #020a02; font-weight: 800;padding-left: 3px;">Injured Name</span><span style="color: #020a02;padding-left: 1px;">
                                        James Dotlin
                                    </span>
                                </p>
                            </div>
                            <div style="display: inline;">
                                <p style="display: inline;">
                                    <span style="border: 1px solid rgb(243, 247, 210);border-radius:50%;padding: 6px 3px;padding-left: 13px;text-align: center;">
                                        2.
                                    </span>
                                    <span style="color: #020a02; font-weight: 800;padding-left: 3px;">Injured DOB</span><span style="color: #020a02;padding-left: 1px;">
                                        Aug 21, 2024
                                    </span>
                                </p>
                            </div>
                            <div style="display: inline;">
                                <p style="display: inline;">
                                    <span style="border: 1px solid rgb(243, 247, 210);border-radius:50%;padding: 6px 3px;padding-left: 13px;text-align: center;">
                                        3.
                                    </span>
                                    <span style="color: #020a02; font-weight: 800;padding-left: 3px;">Date Of Injury</span><span style="color: #020a02;padding-left: 1px;">
                                        Aug 21, 2024
                                    </span>
                                </p>
                            </div>
                            <div style="display: inline;">
                                <p style="display: inline;">
                                    <span style="border: 1px solid rgb(243, 247, 210);border-radius:50%;padding: 6px 3px;padding-left: 13px;text-align: center;">
                                        4.
                                    </span>
                                    <span style="color: #020a02; font-weight: 800;padding-left: 3px;">Height</span><span style="color: #020a02;padding-left: 1px;">
                                        175 Cm
                                    </span>
                                </p>
                            </div>
                            <div style="display: inline;">
                                <p style="display: inline;">
                                    <span style="border: 1px solid rgb(243, 247, 210);border-radius:50%;padding: 6px 3px;padding-left: 13px;text-align: center;">
                                        5.
                                    </span>
                                    <span style="color: #020a02; font-weight: 800;padding-left: 3px;">Weight</span><span style="color: #020a02;padding-left: 1px;">
                                        77 Kg
                                    </span>
                                </p>
                            </div>
                            <div style="display: inline;">
                                <p style="display: inline;">
                                    <span style="border: 1px solid rgb(243, 247, 210);border-radius:50%;padding: 6px 3px;padding-left: 13px;text-align: center;">
                                        6.
                                    </span>
                                    <span style="color: #020a02; font-weight: 800;padding-left: 3px;">Injury State</span><span style="color: #020a02;padding-left: 1px;">
                                        Lorem ipsum
                                    </span>
                                </p>
                            </div>
                            <div style="display: inline;">
                                <p style="display: inline;">
                                    <span style="border: 1px solid rgb(243, 247, 210);border-radius:50%;padding: 6px 3px;padding-left: 13px;text-align: center;background-color: red;line-height: 4;">
                                        7.
                                    </span>
                                    <span style="color: #020a02; font-weight: 800;padding-left: 3px;">Married</span><span style="color: #020a02;padding-left: 1px;">
                                        Yes
                                    </span>
                                </p>
                            </div>
                            <div style="display: inline;padding-left: 3px;">
                                <p style="display: inline;">
                                    <span style="border: 1px solid rgb(243, 247, 210);border-radius:50%;padding: 6px 3px;padding-left: 13px;text-align: center;background-color: red;line-height: 4;">
                                        8.
                                    </span>
                                    <span style="color: #020a02; font-weight: 800;padding-left: 3px;">Dependents</span><span style="color: #020a02;padding-left: 1px;">
                                        N/A
                                    </span>
                                </p>
                            </div>
                        </div> 
                    </td>
                </tr>

                <tr>
                    <td data-title="Name">
                        <div style="display: table; margin: 0 auto; width: 100%;">
                            
                            <p style="font-weight: 700;padding-top: 10px;font-size: 25px;">Caller Info: </p>
                            <div style="display: inline;padding-right: 5px;">
                                <p style="display: inline;">
                                    <span style="border: 1px solid rgb(243, 247, 210);border-radius:50%;padding: 6px 3px;padding-left: 13px;text-align: center;background-color: red;">
                                        1.
                                    </span>
                                    <span style="color: #020a02; font-weight: 800;padding-left: 3px;">Caller Name</span><span style="color: #020a02;padding-left: 1px;">
                                        James Dotlin
                                    </span>
                                </p>
                            </div>
                            <div style="display: inline;">
                                <p style="display: inline;">
                                    <span style="border: 1px solid rgb(243, 247, 210);border-radius:50%;padding: 6px 3px;padding-left: 13px;text-align: center;">
                                        2.
                                    </span>
                                    <span style="color: #020a02; font-weight: 800;padding-left: 3px;">Phone</span><span style="color: #020a02;padding-left: 1px;">
                                        1234567890
                                    </span>
                                </p>
                            </div>
                            <div style="display: inline;">
                                <p style="display: inline;">
                                    <span style="border: 1px solid rgb(243, 247, 210);border-radius:50%;padding: 6px 3px;padding-left: 13px;text-align: center;">
                                        3.
                                    </span>
                                    <span style="color: #020a02; font-weight: 800;padding-left: 3px;">Address</span><span style="color: #020a02;padding-left: 1px;">
                                        69 Crossvine Ct. Saint Mathiews, SC 29135 
                                    </span>
                                </p>
                            </div>
                            <div style="display: inline;">
                                <p style="display: inline;">
                                    <span style="border: 1px solid rgb(243, 247, 210);border-radius:50%;padding: 6px 3px;padding-left: 13px;text-align: center;line-height: 4;">
                                        4.
                                    </span>
                                    <span style="color: #020a02; font-weight: 800;padding-left: 3px;">Email</span><span style="color: #020a02;padding-left: 1px;line-height: 4;">
                                        jamesdotlin@gmail.com
                                    </span>
                                </p>
                            </div>
                            <div style="display: inline;">
                                <p style="display: inline;">
                                    <span style="border: 1px solid rgb(243, 247, 210);border-radius:50%;padding: 6px 3px;padding-left: 13px;text-align: center;">
                                        5.
                                    </span>
                                    <span style="color: #020a02; font-weight: 800;padding-left: 3px;">Relation To Injured Party</span><span style="color: #020a02;padding-left: 1px;">
                                        No
                                    </span>
                                </p>
                            </div>
                        </div> 
                    </td>
                </tr>

                <tr>
                    <td data-title="Name">
                        <div style="display: table; margin: 0 auto; width: 100%;">
                            
                            <p style="font-weight: 700;padding-top: 10px;font-size: 25px;">Evaluation Synopsis: </p>
                            <ol style="padding-inline-start: 18px;margin-top: 36px;">
                                <li style="font-size: 16px; margin-bottom: 20px;">
                                    <div style="color: #020a02; font-weight: 600;width: 33%;">Is there a siginificant or permanent injury or damage? : </div>
                                    <div style="width: 67%;margin-left: 33%;margin-top: -20px;">my text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more rec</div>
                                </li>
                                <li style="font-size: 16px; margin-bottom: 20px;">
                                    <div style="color: #020a02; font-weight: 600;width: 40%;">Is there an apparent or suggested deviation in the standard of care? : </div>
                                    <div style="width: 60%;margin-left: 40%;margin-top: -20px;">my text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recenctly with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</div>
                                </li>
                                <li style="font-size: 16px; margin-bottom: 20px;">
                                    <div style="color: #020a02; font-weight: 600;width: 42%;">Is there a direct link between the deviation and the injury or damage? : </div>
                                    <div style="width: 58%;margin-left: 42%;margin-top: -20px;">my text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recenctly with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</div>
                                </li>
                                <li style="font-size: 16px; margin-bottom: 20px;">
                                    <div style="color: #020a02; font-weight: 600;width: 30%;">Further review of medical records recommended? : </div>
                                    <div style="width: 70%;margin-left: 30%;margin-top: -20px;">my text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recenctly with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</div>
                                </li>
                            </ol>
                        </div>
                    </td>
                </tr>

            </tbody>
        </table>
        <table>
            <tbody>
                <tr>
                    <td data-title="Name"></td>
                        <div style="display: table; margin: 0 auto; width: 95%;">
                            <hr>
                            <p style="padding-top: 10px;text-align: center;">Thank you for using MedView Services. For questions about this evaluation or feedback on our services, simply reply to this email. MedView Services medical-merit recommendations are based solely on information as needed to make the final decision whether to accept or reject any potential case evaluated by MedView Services. Under no circumstances should this evaluation be considered legal or medical advice.</p>
                            
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
  `;

        // Define the options for PDF generation
        // const options = {
        //     format: 'A4',
        //     border: {
        //         top: '0.5in',
        //         right: '0.5in',
        //         bottom: '0.5in',
        //         left: '0.5in',
        //     },
        // };

            // Define the options for PDF generation
    const options = {
        format: 'A4',
        orientation: 'portrait',
        margin: {
            top: '1in',
            right: '1in',
            bottom: '1in',
            left: '1in',
        },
        printBackground: true, // Ensures background colors and images are printed
    };

        // Convert HTML string to PDF
        pdf.create(html, options).toFile(path.join(__dirname, 'output3.pdf'), (err, result) => {
            if (err) {
                return res.status(500).send('Error creating PDF');
            }
            // Send the generated PDF file as a response
            res.sendFile(result.filename);
        });

    }
}

export default AdminController