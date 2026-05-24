import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("🔗 Attempting MongoDB connection...");
    console.log("MONGO_URI present:", !!process.env.MONGO_URI);
    
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✓ MongoDB Connected successfully");
    console.log("DB Name:", mongoose.connection.name);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("Error Code:", error.code);
    console.error("Full Error:", error);
    // Don't exit, let server start but operations will fail
    process.exit(1);
  }
};

export default connectDB;