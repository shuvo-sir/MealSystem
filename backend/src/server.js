import "dotenv/config";
import { pathToFileURL } from "node:url";
import app from "./app.js";
import connectDB from "./config/db.js";
import cron from "./config/cron.js";

const validateEnvironment = () => {
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("Missing required environment variable: CLERK_SECRET_KEY");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("Missing required environment variable: MONGO_URI");
  }
};

export const startServer = async (options = {}) => {
  const { port = process.env.PORT || 5000, startCron = true } = options;

  validateEnvironment();
  await connectDB();

  if (startCron) {
    cron.start();
  }

  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      resolve(server);
    });

    server.on("error", (error) => {
      reject(error);
    });
  });
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer().catch((error) => {
    console.error("Backend startup failed:", error.message || error);
    process.exit(1);
  });
}
