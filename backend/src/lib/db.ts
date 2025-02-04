import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        await mongoose.connect(process.env.DB_URL ?? '');
        console.log('connected successfully with database');
    }catch(err){
        console.log(err);
    }
}