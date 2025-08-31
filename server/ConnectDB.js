import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDb = async () => {
  try {
    console.log("Connecting to DB:", process.env.MONGO_URI_ATLAS);

    const conn = await mongoose.connect(process.env.MONGO_URI_ATLAS, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Successfully connected to AIVA database");
    return conn; 
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDb;
