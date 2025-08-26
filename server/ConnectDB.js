import mongoose from "mongoose";

const MONGO_URI_ATLAS = process.env.MONGO_URI_ATLAS || "mongodb://127.0.0.1:27017/smart_office";

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
