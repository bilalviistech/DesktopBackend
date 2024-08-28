
import LeadGeneration from "../Models/LeadGeneration.js"

class LeadController {

    //Lead Generate By SalesOfficer
    static async LeadGenerate(req, res) {
        try {
            const SaleOfficer = req.user
            if (SaleOfficer.role === "SalesOfficer") {
                const { firstName, lastName, emailAddress, callerID, primaryPhone, secondaryPhone, address, relation, anySynopsis } = req.body

                const newLeadGeneration = new LeadGeneration({
                    SaleOfficeId: SaleOfficer._id,
                    firstName,
                    lastName,
                    emailAddress,
                    callerID,
                    primaryPhone,
                    secondaryPhone,
                    address,
                    relation,
                    anySynopsis
                })
                await newLeadGeneration.save()

                res.status(200).json({
                    success: true,
                    message: "Lead generation sucsessfully."
                })
            }
            else {
                res.status(200).json({
                    success: false,
                    message: "You aren't allowed to generate a Lead."
                })
            }

        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message
            })
        }

    }

    // Get My All Lead 
    static async MyAllLead(req, res) {
        try {
            const SaleOfficeId = req.user._id
            const MyAllLead = await LeadGeneration.find({ SaleOfficeId: SaleOfficeId })

            res.status(200).json({
                success: true,
                data: MyAllLead
            })
        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message
            })
        }
    }

    // Get My All Pending Lead
    static async MyPendingLead(req, res) {
        try {
            const SaleOfficeId = req.user._id
            const MyPendingLead = await LeadGeneration.find({
                SaleOfficeId: SaleOfficeId,
                status: "Pending"
            })

            res.status(200).json({
                success: true,
                data: MyPendingLead
            })
        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message
            })
        }
    }

    // Get My All Completed Lead
    static async MyCompletedLead(req, res) {
        try {
            const SaleOfficeId = req.user._id
            const MyCompletedLead = await LeadGeneration.find({
                SaleOfficeId: SaleOfficeId,
                status: "Completed"
            })

            res.status(200).json({
                success: true,
                data: MyCompletedLead
            })
        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message
            })
        }
    }

    // Get All Lead
    static async AllLead(req, res) {
        try {
            const role = req.user.role
            if (role === "Nurse") {
                const AllLead = await LeadGeneration.find({})

                res.status(200).json({
                    success: true,
                    data: AllLead
                })
            }
            else {
                res.status(200).json({
                    success: false,
                    message: "You aren't allowed to access all leads."
                })
            }

        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message
            })
        }
    }

    // Get All Pending Lead
    static async AllPendingLead(req, res) {
        try {
            const role = req.user.role
            if (role === "Nurse") {
                const AllPendingLead = await LeadGeneration.find({ status: "Pending" })

                res.status(200).json({
                    success: true,
                    data: AllPendingLead
                })
            }
            else {
                res.status(200).json({
                    success: false,
                    message: "You aren't allowed to access all leads."
                })
            }

        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message
            })
        }
    }

    // Get All Completed Lead
    static async AllCompletedLead(req, res) {
        try {
            const role = req.user.role
            if (role === "Nurse") {
                const AllCompletedLead = await LeadGeneration.find({ status: "Completed" })

                res.status(200).json({
                    success: true,
                    data: AllCompletedLead
                })
            }
            else {
                res.status(200).json({
                    success: false,
                    message: "You aren't allowed to access all leads."
                })
            }

        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message
            })
        }
    }

    // Finalize The Pending Lead
    static async FinalizeLead(req, res) {

        try {
            const { relation,
                nameOfInjured,
                DOB,
                height,
                weight,
                dateOfInjury,
                state,
                natureOfInjury,
                synopsis,
                resultingDamage,
                allegedNegligence,
                furtherTreatment,
                relevantMedicalHx,
                relevantMedicalHy
            } = req.body

            const leadId = req.params.id
            const NurseId = req.user._id

            await LeadGeneration.findByIdAndUpdate({ _id: leadId }, {
                $set: {
                    NurseId: NurseId,
                    completedRecord: req.body,
                    status: "Completed"
                }
            })

            res.status(200).json({
                success: true,
                message: "Lead confirmed successfully."
            })
        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message
            })
        }

    }
}

export default LeadController