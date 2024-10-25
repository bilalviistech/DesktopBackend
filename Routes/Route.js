import express from 'express'
const router = express.Router()
import AdminController from '../Controllers/AdminController.js'
import LeadController from '../Controllers/LeadController.js'
import Auth from '../Middleware/AuthMiddleware.js'
import multer from 'multer'

// Multer For Upload Pics
const UserPicStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Public/Profiles');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Create multer upload instance
const uploadUserPic = multer({ storage: UserPicStorage });

// Define fields for profile and cover pictures
const uploadFields = [
    { name: 'profilePic', maxCount: 1 },
    { name: 'coverPic', maxCount: 1 }
];

// Admin Routes
router.post('/register', uploadUserPic.fields(uploadFields), AdminController.Register)
router.post('/login', AdminController.Login)
router.get('/get-all-user', Auth, AdminController.GetAllUser)
router.post('/edit-profile', Auth, uploadUserPic.single('profile'), AdminController.EditProfile)
router.post('/delete-pic', Auth, AdminController.DeletePic)
router.post('/change-pasword', Auth, AdminController.ChangePasword)
router.post('/forget-password', AdminController.ForgetPassword)
router.post('/forget-password-code-verify/:code/:userId', AdminController.ForgetPasswordCodeVerify)
router.post('/forget-change-password', AdminController.ForgetChangePassword)


// Genrate PDF
router.post('/generate-pdf', AdminController.generatePDF)


// Lead Routes
// Generate The Lead
router.post('/lead-generate', Auth, LeadController.LeadGenerate)

// Get My Leads
router.get('/my-all-lead', Auth, LeadController.MyAllLead)
router.get('/my-pending-lead', Auth, LeadController.MyPendingLead)
router.get('/my-completed-lead', Auth, LeadController.MyCompletedLead)

// Get All My Intake Reoprts
router.get('/get-all-intake-report', Auth, LeadController.GetAllIntakeReports)


// Get All Leads
router.get('/all-lead', Auth, LeadController.AllLead)
router.get('/get-all-new-lead', Auth, LeadController.GetAllNewLead)
router.get('/all-pending-lead', Auth, LeadController.AllPendingLead)
router.get('/all-completed-lead', Auth, LeadController.AllCompletedLead)

// My Clients
router.get('/my-clients', Auth, LeadController.MyClients)

// Finalize The Leads
router.post('/finalize-lead/:id', Auth, LeadController.FinalizeLead)


export default router