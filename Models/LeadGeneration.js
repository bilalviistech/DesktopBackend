import mongoose from "mongoose";

const LeadGenerationSchema = new mongoose.Schema({
    SaleOfficeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    NurseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
        // required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    emailAddress: {
        type: String,
        required: true
    },
    callerID: {
        type: Number,
        required: true
    },
    primaryPhone: {
        type: Number,
        required: true
    },
    secondaryPhone: {
        type: String,
        // required: true
    },
    address: {
        type: String,
        required: true
    },
    relation: {
        type: String,
        required: true
    },
    anySynopsis: {
        type: String,
        // required: true
    },
    status: {
        type: String,
        required: true,
        enum: ["Pending", "Intake", "Completed"],
        default: "Pending"
    },
    completedRecord: {
        type: Object,
        default: null
    },
    isInTake: {
        type: Boolean,
        required: true,
        default: false
    }
})

const LeadGeneration = mongoose.model('LeadGeneration',LeadGenerationSchema)
export default LeadGeneration