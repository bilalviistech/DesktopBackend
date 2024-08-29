import mongoose from 'mongoose';
import dotenv from 'dotenv'
dotenv.config()

const connectDB = async () => {
    try {
        // nuzzle database use
        await mongoose.connect(process.env.URI);
        console.log("DB has been connected");
    } catch (err) {
        console.log("DB connection error: ", err.message);
    }
};

export default connectDB;
