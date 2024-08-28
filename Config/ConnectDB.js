import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("DB has been connected");
    } catch (err) {
        console.log("DB connection error: ", err.message);
    }
};

export default connectDB;
