import express from 'express'
import route from './Routes/Route.js'
import dotenv from 'dotenv'
dotenv.config()
import connectDB from './Config/ConnectDB.js'
connectDB()

const app = express()

// Middleware to parse JSON bodies
app.use(express.json())

// Middleware to parse urlencoded bodies (Form data)
app.use(express.urlencoded({ extended: true }))

// Use your routes
app.use('/', route)

// Static routes for access files
app.use('/public/Profiles/', express.static('./Public/Profiles/'))
const PORT = process.env.PORT || 3024

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}/`))
