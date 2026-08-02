import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import cron from "./config/cron.js";

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.warn("⚠️ MongoDB connection failed at startup:", error?.message || error);
  }

  cron.start();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

startServer();
