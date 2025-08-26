import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

const MONGO_URI_ATLAS = process.env.MONGO_URI_ATLAS;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI_ATLAS, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Successfully Connected To AIVA`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); 
  }
};

export default connectDB;
