import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured. Please set it before starting the backend.");
  }

  try {
    console.log("🔗 Attempting MongoDB connection...");
    console.log("MONGO_URI present:", !!process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✓ MongoDB Connected successfully");
    console.log("DB Name:", mongoose.connection.name);
    return true;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("Error Code:", error.code);
    console.error("Full Error:", error);
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};

export default connectDB;
