import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import cron from "./config/cron.js";

if (!process.env.CLERK_SECRET_KEY) {
  console.error("Missing required environment variable: CLERK_SECRET_KEY");
  console.error("Clerk authentication cannot work without CLERK_SECRET_KEY. Exiting.");
  process.exit(1);
}

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
