import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDb = async () => {
  try {
    // 1. Check if already connected (readyState 1 = connected)
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    // 2. Check if currently connecting (readyState 2 = connecting)
    if (mongoose.connection.readyState === 2) {
      console.log("⏳ MongoDB is connecting...");
      return mongoose.connection;
    }

    // 3. Connect
    const conn = await mongoose.connect(process.env.MONGO_URI_ATLAS);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn; 

  } catch (err) {
    console.error(`❌ MongoDB Error: ${err.message}`);
    
  }
};

export default connectDb;