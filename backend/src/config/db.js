import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn("⚠️ MONGO_URI is not configured. Skipping MongoDB connection.");
    return false;
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
    console.warn("⚠️ Server startup continues, but database operations may fail.");
    return false;
  }
};

export default connectDB;
