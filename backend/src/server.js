import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import cron from "./config/cron.js";

dotenv.config();

connectDB();
cron.start();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


console.log(
  "PK:",
  process.env.CLERK_PUBLISHABLE_KEY
);

console.log(
  "SK:",
  process.env.CLERK_SECRET_KEY
);
