import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
    LeadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name:{
        type: String,
        required: [true, "User name must be filled"]
    },
    email:{
        type: String,
        required: [true, "Email can't be empty"]
    },
    password:{
        type: String,
        required: true
    },
    profilePic: {
        type: String,
        // required: true
    },
    coverPic: {
        type: String,
        // required: true
    },
    role:{
        type: String,
        required: true,
        enum:["SalesOfficer", "Nurse", "Admin"]
    },
    bio: {
        type: String,
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
})

const Report = mongoose.model("Report", ReportSchema)
export default Report